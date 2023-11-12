import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CustomersService } from 'src/app/services/firebase/customers.service';
import { map } from 'rxjs/operators';
import { ToastService } from 'src/app/services/toast.service';
import { NavController, AlertController } from '@ionic/angular';
import * as _ from 'lodash';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
})
export class SignupPage implements OnInit {

  signupForm: FormGroup;
  customersList: any = [];
  loading = false;
  
  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private customersService: CustomersService,
    public toastService: ToastService,
    public navController: NavController,
    public alertController: AlertController
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
      studentId: ['', Validators.compose([ Validators.required])],
      customerId: ['', Validators.compose([Validators.required])],
      customerName: ['', Validators.compose([Validators.required])],
      password: ['', Validators.compose([Validators.required, Validators.minLength(8)])],
      verifyPassword: ['', Validators.compose([Validators.required, Validators.minLength(8)])]
    });
  }

  getSubscriptions() {
    this.loading = true;
    this.customersService.getCustomersPublicList().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    ).subscribe( (customers) => {
      console.log(customers);
      this.customersList = customers;
      this.loading = false;
    })
  }

  onChange(event) {
    console.log(event.target.value);
    const selected = event.target.value;
    const customerName = _.find(this.customersList, (o) => {
      return o.id == selected;
    });
    this.signupForm.controls['customerName'].setValue(customerName.name);
    console.log(this.signupForm.value);
  }

  async signUpWarning() {
    const alert = await this.alertController.create({
      header: '¡Confirmación!',
      message: 'Confirma que te estás registrando en <strong>' + this.signupForm.controls['customerName'].value + '</strong>, ya que esta acción no puede modificarse después.',
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
          this.toastService.presentToast(err.message);
          this.loading = false;
        });
      }).catch((err) => {
        console.log(err);
        this.toastService.presentToast(err.message);
        this.loading = false;
      });
    } else {
      this.toastService.presentToast('Por favor ingresa correctamente tus datos de registro', 3000, 'warning');
    }
  }

  backToSignIn() {
    this.navController.navigateBack('auth/signin');
  }

}
