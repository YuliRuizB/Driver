import { Component, OnInit } from '@angular/core';
import { AuthService } from '@shared/services/auth.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.page.html',
  styleUrls: ['./verify.page.scss'],
})

export class VerifyPage implements OnInit {

  constructor(
    private authService: AuthService,
    private toastController: ToastController
  ) {
   }

  ngOnInit() {
  }

  sendVerificationMail() {
    this.authService.sendVerificationMail().then(() => {
      this.presentToast('Se ha enviado nuevamente un mensaje a tu cuenta de correo electrónico para validar tu cuenta.', 3000, 'success');
    })
    .catch( err => this.presentToast(err, 3000, 'danger'))
  }

  async presentToast(message: string, duration: number, color: string) {
    const toast = await this.toastController.create({
      message,
      duration,
      color,
      position: 'bottom'
    });
    toast.present();

  }

}
