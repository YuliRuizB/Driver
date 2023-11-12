import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { map } from 'rxjs/operators';
import { NavController, AlertController, ToastController } from '@ionic/angular';
import * as _ from 'lodash';
import { AuthService } from '@shared/services/auth.service';
import { VendorService } from '@shared/services/firebase/vendors.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

  signupForm: FormGroup;
  vendorsList: any = [];
  loading = false;
  
  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    public navController: NavController,
    public alertController: AlertController,
    private vendorService: VendorService,
    public toastController: ToastController
  ) { }

  ngOnInit() {
    this.createForm();
    this.getSubscriptions();
  }

  createForm() {
    this.signupForm = this.fb.group({
      firstName: ['', Validators.compose([Validators.required, Validators.maxLength(30), Validators.minLength(5)])],
      lastName: ['', Validators.compose([Validators.required, Validators.maxLength(30), Validators.minLength(5)])],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      employeeId: ['', Validators.compose([Validators.minLength(7), Validators.maxLength(7), Validators.required])],
      vendorId: ['', Validators.compose([Validators.required])],
      vendorName: ['', Validators.compose([Validators.required])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(8)])],
      verifyPassword: ['', Validators.compose([Validators.required, Validators.minLength(8)])]
    });
  }

  getSubscriptions() {
    this.loading = true;
    this.vendorService.getVendorsPublicList().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    ).subscribe( (customers) => {
      console.log(customers);
      this.vendorsList = customers;
      this.loading = false;
    })
  }

  onChange(event) {
    console.log(event.target.value);
    const selected = event.target.value;
    const vendorName = _.find(this.vendorsList, (o) => {
      return o.id == selected;
    });
    this.signupForm.controls['vendorName'].setValue(vendorName.name);
    console.log(this.signupForm.value);
    console.log(this.signupForm.valid);
  }

  async signUpWarning() {
    const alert = await this.alertController.create({
      header: '¡Confirmación!',
      message: 'Confirma que te estás registrando en <strong>' + this.signupForm.controls['vendorName'].value + '</strong>, ya que esta acción no puede modificarse después.',
      buttons: [
        {
          text: 'Corregir',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Confirmar',
          handler: () => {
            this.signup();
          }
        }
      ]
    });

    await alert.present();
  }

  signup() {
    let data = this.signupForm.value;
    let credentials = data;
    if (this.signupForm.valid) {
      this.loading = true;
      this.authService.signup(credentials).then((result) => {
        result.user.updateProfile({
          displayName: this.signupForm.controls['firstName'].value,
          photoURL: 'assets/img/male_avatar.png'
        });
        this.authService.sendVerificationMail();
        this.authService.setUserData(credentials, result.user).then( () => {
          this.navController.navigateForward('auth/verify');
          this.loading = false;
        }).catch((err) => {
          console.log(err);
          this.presentToast(err.message);
          this.loading = false;
        });
      }).catch((err) => {
        console.log(err);
        this.presentToast(err.message);
        this.loading = false;
      });
    } else {
      this.presentToast('Por favor ingresa correctamente tus datos de registro', 3000, 'warning');
    }
  }

  async presentToast(message: string, duration?: number, color?: string) {
    const toast = await this.toastController.create({
      message,
      duration: duration || 3000,
      color: color || 'danger',
      position: 'bottom'
    });
    toast.present();

  }

  backToSignIn() {
    this.navController.navigateBack('auth/signin');
  }

}
