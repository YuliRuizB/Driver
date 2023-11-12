import { Component, OnInit } from '@angular/core';
import { ContactusService } from '../services/firebase/contactus.service';
import { map } from 'rxjs/operators';
import { StorageService } from '../services/storage/storage.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.page.html',
  styleUrls: ['./contact-us.page.scss'],
})
export class ContactUsPage implements OnInit {

  contactUsInfo: any = {};
  message: any = '';
  userData: any;
  button = false;
  loading = false;

  constructor(private contactUsService: ContactusService, private storageService: StorageService, public toastController: ToastController) { 
    this.getSubscriptions();
    this.storageService.getItem('userData').then( (userData) => {
      this.userData = JSON.parse(userData);
    })
  }

  ngOnInit() { }

  getSubscriptions() {
    this.loading = true;
    this.contactUsService.getAboutUsInfo().pipe(
      map(a => {
        const data = a.payload.data() as any;
        const id = a.payload.id;
        return { id, ...data };
      })
    ).subscribe( (contactUsInfo) => {
      console.log(contactUsInfo);
      this.contactUsInfo = contactUsInfo;
      this.loading = false;
    })
  }

  sendMessage() {
    this.loading = true;
    this.button = true;
    this.contactUsService.sendMessage(this.userData, this.message).then( (response) => {
      console.log(response);
      this.loading = false;
      this.presentToast();
    });
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: '¡Gracias! Hemos recibido tu mensaje, en breve estaremos atendiéndolo.',
      duration: 3000,
      color: 'success'
    });

    toast.onDidDismiss().then( (response) => {
      // set button enabled
      this.button = false;
    })
    toast.present();
  }

}
