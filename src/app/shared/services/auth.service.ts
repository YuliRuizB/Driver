import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as firebase from 'firebase/app';
import { IUser, IUserCredentials, IRoles } from '../interfaces/user';
import { NavController, AlertController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { filter, map, takeUntil, take } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';

export const USER = 'user';
export const USER_PROFILE = 'user_profile';
export const USER_COLLECTION = 'drivers';
export const USER_ALLOWED_ROLE = 'driver';

@Injectable({ 
  providedIn: 'root'
})
export class AuthService {

  public user: Observable<IUser>;
  user_profile: BehaviorSubject<any> = new BehaviorSubject(null);
  loading = new BehaviorSubject(false);
  userAuthState = new BehaviorSubject(null);
  unsubscribeOnSignout$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  userState: BehaviorSubject<any> = new BehaviorSubject([]);


  constructor(
    private navController: NavController,
    private auth: AngularFireAuth,
    private router:Router,
    private storage: Storage,
    private afs: AngularFirestore,
    public alertController: AlertController
  ) {
    this.storage.create();
    this.getLocalStorageUser();
    this.unsubscribeOnSignout$.next(false);
    this.unsubscribeOnSignout$.complete();
    this.user = this.userAuthState.asObservable().pipe(
      filter(response => response)
    );
    this.user_profile.asObservable().pipe(
      filter(response => response)
    );
   
   }

  getUserProfile(): Observable<IUser> {
    return this.user_profile.asObservable();
  }

  getUserFromDB() {
    return this.userState;
  }


  getLocalStorageUser() {
    this.storage.get(USER).then( (data) => {
      const user = JSON.parse(data);
      if (user) {
        this.userAuthState.next(user);
        this.afs.collection(USER_COLLECTION).doc(user.uid).snapshotChanges().pipe(
          map(a => {
            const data = a.payload.data() as any;
            const id = a.payload.id;
            return { id, ...data};
          }),
          takeUntil(this.unsubscribeOnSignout$)
        ).subscribe( (user_profile:any) => {
          if(user_profile) {
            console.log(user_profile);
            if(user_profile.disabled && user_profile.roles[0] != USER_ALLOWED_ROLE) {
              console.log('user is disabled: ', user_profile.disabled);
              this.signout();
            } else {
              this.user_profile.next(user_profile);
              this.storage.set(USER_PROFILE, JSON.stringify(user_profile));
            }
          }
        })
      } else {
        console.log('no user found in storage');
        this.userAuthState.next({uid: null, email: null, password: null, roles: []});
        this.user_profile.next({uid: null, email: null, password: null, roles: []});
      }
    });
  }

  signin(credentials: IUserCredentials) {
    this.loading.next(true);
    this.auth.signInWithEmailAndPassword(credentials.email, credentials.password).then( (response) => {
      console.log("response 1");
      console.log(response);
      const user = response.user;
      this.afs.collection(USER_COLLECTION).doc(user.uid)
      .get()
      .pipe(take(1),
      map(a => {
        const data = a.data() as any;
        const id = a.id;
        return { id, ...data };
      }))
      .subscribe( user_profile => {
        console.log("user_profile");
        console.log(user_profile);
        const roles = user_profile.roles || [];
        const disabled = user_profile.disabled || false;
        if(roles.includes(USER_ALLOWED_ROLE)) {
          if(disabled) {
            this.presentAlert('Usuario deshabilitado','Su cuenta de usuario está deshabilitada. Si está deshabilitado por error, por favor contáctanos.');
          } else {
            this.userAuthState.next(user);
            this.storage.set(USER, JSON.stringify(user));  
            this.user_profile.next(user_profile);
            this.storage.set(USER_PROFILE, JSON.stringify(user_profile));  
            this.router.navigateByUrl('/main');
          }
        } else {
          this.presentAlertRoleError();
        }
        this.loading.next(false);
      });
    }, error => {
      console.log('error', error);
      this.presentAlert('Error',error);
    });
  }

  signout() {
    this.loading.next(true);
    this.auth.signOut().then( () => {
      this.userAuthState.next({uid: null, email: null, password: null});
      this.user_profile.next({uid: null, email: null, password: null});
      this.storage.remove(USER);
      this.storage.remove(USER_PROFILE);
      this.unsubscribeOnSignout$.next(true);
      this.unsubscribeOnSignout$.complete();
      this.loading.next(false);
      this.navController.navigateBack('auth');
    }, err => {
      this.presentAlert('Error','Algún problema hay con el sistema. Cierra la aplicación y vuélvela a abrir. Revisa que tu conexión de internet esté funcionando correctamente.');
      this.loading.next(false);
      this.navController.navigateBack('auth');
    })
  }

  signup(form) {
    return this.auth.createUserWithEmailAndPassword(form.email, form.password);
  }

  sendVerificationMail() {
    return this.auth.currentUser.then((currentUser) => {
      return currentUser.sendEmailVerification();
    })
    
  }

  sendPasswordResetEmail(email: string) {
    return this.auth.sendPasswordResetEmail(email);
  }

  hasRoles(roles: IRoles[]): boolean {
    if(!!this.user_profile) {
      if (this.user_profile.value && this.user_profile.value.roles) {
        for (const role of this.user_profile.value.roles) {
          if(roles.includes(role)) {
            console.log("hasRoles is true");
            return true;
          }
        }
        return false;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  hasRole(roles: IRoles[]): boolean {
    console.log('roles from directive: ', roles);
    for (const role of roles) {
      console.log('user_profile', this.user_profile.value);
      if(!!this.user_profile) {
        if (!this.user_profile.value || !this.user_profile.value.roles.includes(role)) {
          console.log("hasRoles is false");
          return false;
        }
      } else {
        return false;
      }   
    }
    console.log("hasRoles is true");
    return true;
  }

  setUserData(user, result) {
    console.log(user);
    console.log(result);
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`${USER_COLLECTION}/${result.uid}`);
    const userData = {
      uid: result.uid,
      email: result.email,
      displayName: `${user.firstName} ${user.lastName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      photoURL: user.photoURL || "",
      emailVerified: result.emailVerified,
      address: {
        addressLine: '',
        city: '',
        postCode: '',
        state: ''
      },
      occupation: 'driver',
      phone: '',
      refreshToken: '',
      roles: ['driver'],
      socialNetworks: {
        facebook: '',
        instagram: '',
        apple: '',
        google: '',
        linkedIn: '',
        twitter: ''
      },
      username: user.firstName,
      _isEditMode: false,
      _userId: result.uid,
      customerName: user.vendorName,
      customerId: user.vendorId,
      employeeId: user.employeeId,
      vendorId: user.vendorId,
      vendorName: user.vendorName
    }

    // let customerRequest = {
    //   creation_date: new Date().toISOString(),
    //   name: user.firstName,
    //   last_name: user.lastName,
    //   email: result.email,
    //   phone_number: null,
    //   external_id: result.uid,
    //   requires_account: false,
    //   status: "active"
    // }

    return userRef.set(userData, {merge: true});
    // .then( () => {
    //   return this.openpayService.newOpenpayCustomer(customerRequest)
    // })
    
  }

  async presentAlertRoleError() {
    const alert = await this.alertController.create({
      header: 'Mensaje del sistema',
      subHeader: 'Usuario sin acceso',
      message: 'Esta aplicación es exclusiva para conductores de la comunidad Bus2U. Para estudiantes, padres de familia y colaboradores hay otras aplicaciones.',
      buttons: ['OK']
    });

    alert.onDidDismiss().then( () => {
      this.signout();
    })

    await alert.present();
  }

  async presentAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });

    alert.onDidDismiss().then( () => {
      this.signout();
    })

    await alert.present();
  }
}
