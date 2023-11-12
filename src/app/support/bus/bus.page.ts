import { Component, OnInit } from '@angular/core';
import { ToastController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-bus',
  templateUrl: './bus.page.html',
  styleUrls: ['./bus.page.scss'],
})
export class BusPage implements OnInit {

  contactUsInfo: any = {};
  message: any = '';
  userData: any;
  button = false;
  loading = false;
  boardingPassId: any = "";

  constructor(public toastController: ToastController, private navController: NavController) { }

  ngOnInit() {
  }

  sendMessage(initialMessage: string) {
    this.loading = true;
    this.button = false;
    const message = `${initialMessage} ${this.message}`;
    this.presentToast();
    // this.contactUsService.sendMessage(this.userData, message).then( (response) => {
    //   console.log(response);
    //   this.loading = false;
    //   this.presentToast();
    // });
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: '¡Gracias! Hemos recibido tu mensaje, en breve estaremos atendiéndolo.',
      duration: 3000,
      position: 'middle',
      color: 'success'
    });

    toast.onDidDismiss().then( () => {
      // set button enabled
      this.button = true;
      this.loading = false;
      this.navController.pop();
    })
    toast.present();
  }

}
