import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { ShareService } from '../services/share/share.service';
import { StorageService } from '../services/storage/storage.service';
import { IUserData } from '../models/models';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-share',
  templateUrl: './share.page.html',
  styleUrls: ['./share.page.scss'],
})
export class SharePage implements OnInit {

  shareSettings: any = [];
  user: IUserData;

  sliderConfig = {
    slidesPerView: 1.4,
    spaceBetween: 6,
    centeredSlides: true,
    paginator: true
  };

  constructor( private storageService: StorageService,  private shareService: ShareService, private socialSharing: SocialSharing, public alertController: AlertController, public toastController: ToastController) {
    this.storageService.getItem('userData').then( (userData) => {
      this.user = JSON.parse(userData);
      this.getSubscriptions();
    })
   }

  ngOnInit() { }

  getSubscriptions() {
    this.shareService.getActiveShareSettings(this.user.customerId).pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    ).subscribe( (settings) => {
      this.shareSettings = settings;
    });
  }

  shareWith(share: any) {
    let referenceCode = Math.floor(100000 + Math.random() * 900000);
    this.socialSharing.shareWithOptions({
      subject: share.name == 'parents' ? `${share.subject} El código de referencia es: ${referenceCode}` : share.subject,
      message: share.message,
      url: share.url,
      chooserTitle: share.chooserTitle
    }).then(() => {
      console.log('shared');
      if(share.name == 'parents') {
        this.shareService.setParentsReference(this.user, referenceCode);
      }
    }).catch(() => {
      console.log('impossible to share');
    });
  }

}
