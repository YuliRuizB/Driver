import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/firebase/auth.service';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.page.html',
  styleUrls: ['./verify.page.scss'],
})

export class VerifyPage implements OnInit {

  constructor(
    private authService: AuthService,
    private toastService: ToastService
  ) {
   }

  ngOnInit() {
  }

  sendVerificationMail() {
    this.authService.sendVerificationMail().then(() => {
      this.toastService.presentToast('Se ha enviado nuevamente un mensaje a tu cuenta de correo electrónico para validar tu cuenta.', 3000, 'success');
    })
    .catch( err => this.toastService.presentToast(err, 3000, 'danger'))
  }


}
