import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { NavController } from '@ionic/angular';
import { ToastService } from 'src/app/services/toast.service';
import { UsersService } from 'src/app/services/firebase/users.service';
import { map } from 'rxjs/operators';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
  styleUrls: ['./signin.page.scss'],
})
export class SigninPage implements OnInit {

  loginForm: FormGroup;
  loading = false;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    public navController: NavController,
    private toastService: ToastService,
    private usersService: UsersService,
    private storageService: StorageService
  ) {
    this.loginForm = fb.group({
			email: ['', Validators.compose([Validators.required, Validators.email])],
			password: ['', Validators.compose([Validators.required, Validators.minLength(8)])]
		});
   }

  ngOnInit() {
  }

  signin() {
    if(this.loginForm.valid) {
      this.authService.signin(this.loginForm.value).then((response:any) => {
        console.log(response);
        if (response.user) {
          const user = response.user;
          if (!user.emailVerified) {
            this.navController.navigateForward('auth/verify');
          } else {
            this.usersService.getUser(user.uid).pipe(
              map(a => {
                const data = a.payload.data() as any;
                const id = a.payload.id;
                return { id, ...data };
              })
            ).subscribe( (user) => {
              const roles: any[] = user.roles;
              const isUser = roles.includes('user');
              const disabled = user.disabled || false;
              console.log(user.roles.includes('user'));
              if(isUser && !disabled) {
                this.storageService.setItem('userData', JSON.stringify(user));
                this.storageService.getItem('isLoggedIn').then(isLoggedIn => {
                  console.log(isLoggedIn);
                  if(!isLoggedIn) {
                    this.storageService.setItem('isLoggedIn', true);
                  } 
                  this.navController.navigateRoot('home');
                })
              } else {
                console.log('is not a user');
                this.toastService.presentToast('Esta aplicación es exclusiva para usuarios activos de la comunidad Bus2U. Para conductores, padres de familia y colaboradores hay otras aplicaciones.',5000,'danger').then( () => {
                  this.authService.signout().then( () => {
                    this.navController.navigateRoot('');
                  })
                })
              }
            })
            setTimeout(() => {
              
            }, 500);
          }
        } else {
          console.log("error");
        }
      })
      .catch( err => this.toastService.presentToast(err, 3000, 'danger'))
    }
  }


}
