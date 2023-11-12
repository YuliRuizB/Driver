import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PromotionsService } from '../services/promotions.service';
import { IUserData } from '../models/models';
import { StorageService } from '../services/storage/storage.service';
import { map } from 'rxjs/operators';
import { ModalController, IonRouterOutlet } from '@ionic/angular';
import { PromotionDetailsPage } from './promotion-details/promotion-details.page';

@Component({
  selector: 'app-promotions',
  templateUrl: './promotions.page.html',
  styleUrls: ['./promotions.page.scss'],
})

export class PromotionsPage implements OnInit, OnDestroy {

  sub: Subscription;
  promotions: any = [];
  user: IUserData;
  loading: boolean = true;

  constructor(private routerOutlet: IonRouterOutlet, private promotionsService: PromotionsService, private storageService: StorageService, public modalController: ModalController) { }

  ngOnInit() {
    this.storageService.getItem('userData').then( (userData) => {
      this.user = JSON.parse(userData);
      this.getSubscriptions();
    });
  }

  getSubscriptions() {
    this.loading = true;
    this.sub = this.promotionsService.getActivePromotions(this.user).pipe(
        map(actions => actions.map( a => {
          const id = a.payload.doc.id;
          const data = a.payload.doc.data() as any;
          return { id: id, ...data }
        }))
      ).subscribe( (promotions) => {
        this.promotions = promotions;
        this.loading = false;
      }, err => {
        this.loading = false;
        console.log(err);
      })
  }

  ngOnDestroy() {
    if(this.sub) {
      this.sub.unsubscribe();
    }
  }

  async presentModal(promotion: any) {
    const modal = await this.modalController.create({
      component: PromotionDetailsPage,
      backdropDismiss: true,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
      componentProps: {
        promotion
      }
    });
    
    await modal.present();
  }

}
