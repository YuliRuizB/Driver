import { Component, OnInit } from '@angular/core';
import { IonContent,ModalController,NavParams, IonList } from '@ionic/angular';

@Component({
  selector: 'app-show-image-modal',
  templateUrl: './show-image-modal.page.html',
  styleUrls: ['./show-image-modal.page.scss'],
})
export class ShowImageModalPage implements OnInit {
	imageBase64: any;
  sliderOpts = {
    zoom: {
      maxRatio: 2,
    },
  };
  constructor(private _NavParams: NavParams, private _ModalController: ModalController) {
		this.imageBase64 = this._NavParams.get('value');

	 }

  ngOnInit() {
  }

	closePhoto(){
    this._ModalController.dismiss();
  }

}
