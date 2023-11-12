import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-promotion-details',
  templateUrl: './promotion-details.page.html',
  styleUrls: ['./promotion-details.page.scss'],
})
export class PromotionDetailsPage implements OnInit {

  promotion: any;

  constructor(private navParams: NavParams, public modalController: ModalController) { 
    this.promotion = this.navParams.get('promotion');
  }

  ngOnInit() {
  }

  dismissModal() {
    this.modalController.dismiss({
      'dismissed': true
    });
  }

}
