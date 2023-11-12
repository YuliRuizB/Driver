import { Component, OnInit } from '@angular/core';
import { ContactusService } from 'src/app/services/firebase/contactus.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ToastController, NavController } from '@ionic/angular';
import { map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-boardingpass-report',
  templateUrl: './boardingpass-report.page.html',
  styleUrls: ['./boardingpass-report.page.scss'],
})
export class BoardingpassReportPage implements OnInit {

  contactUsInfo: any = {};
  message: any = '';
  userData: any;
  button = false;
  loading = false;
  boardingPassId: any = "";

  constructor(private activatedRoute: ActivatedRoute, private navController: NavController, private contactUsService: ContactusService, private storageService: StorageService, public toastController: ToastController) { 
    this.getSubscriptions();
    this.boardingPassId = this.activatedRoute.snapshot.paramMap.get('id');
    this.storageService.getItem('userData').then( (userData) => {
      this.userData = JSON.parse(userData);
      this.userData.boardingPassProblemReportId = this.boardingPassId;
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

  sendMessage(initialMessage: string) {
    this.loading = true;
    this.button = false;
    const message = `${initialMessage} ${this.message}`;
    this.contactUsService.sendMessage(this.userData, message).then( (response) => {
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

    toast.onDidDismiss().then( () => {
      // set button enabled
      this.button = true;
      this.navController.pop();
    })
    toast.present();
  }

}
