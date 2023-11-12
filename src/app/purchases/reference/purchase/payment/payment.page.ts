import { Component, OnInit } from '@angular/core';
import { PurchasesService } from 'src/app/services/firebase/purchases.service';
import { map } from 'rxjs/operators';
import { AlertController, NavController } from '@ionic/angular';
import { StorageService } from 'src/app/services/storage/storage.service';
import { IUserData } from 'src/app/models/models';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.page.html',
  styleUrls: ['./payment.page.scss'],
})
export class PaymentPage implements OnInit {

  localReference: any = {};
  reference: any = [];
  loading = true;
  status = { // TODO: Convert this var into an exportable var
    'in_progress': 'En proceso',
    'completed': 'Pagado'
  };
  user: IUserData;

  constructor(private navController: NavController, private alertController: AlertController, private storageService: StorageService, private purchasesService: PurchasesService) {
    this.localReference = JSON.parse(localStorage.getItem('payNowReference'));
    localStorage.setItem('payNowReference', null);
   }

  ngOnInit() {
    this.storageService.getItem('userData').then( (userData) => {
      this.user = JSON.parse(userData);
      this.getSubscriptions();
    })
  }

  getSubscriptions() {
    this.loading = true;
    console.log(this.localReference);
    this.purchasesService.getCustomerChargeRequest(this.user.uid, this.localReference.order_id).pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    ).subscribe( (purchaseRequest) => {
      console.log(purchaseRequest);
      this.reference = purchaseRequest;
      if (this.reference && this.reference.authorization) {
        this.presentAlert();
      }
      this.loading = false;
    })
  }

  toText(varName: string) {
    return this.status[varName];
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Confirmación de pago',
      subHeader: 'Se ha recibido el pago',
      message: 'Su pago ha sido recibido con el código de autorización ' + this.reference.authorization,
      buttons: ['OK']
    });

    await alert.present();

    alert.onDidDismiss().then( () => {
      this.navController.navigateBack('purchases');
    })
  }

}
