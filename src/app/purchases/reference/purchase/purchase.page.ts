import { Component, OnInit } from '@angular/core';
import { OpenpayService } from 'src/app/services/openpay/openpay.service';
import { PurchasesService } from 'src/app/services/firebase/purchases.service';
import { ToastService } from 'src/app/services/toast.service';
import { IUserData } from 'src/app/models/models';
import { map } from 'rxjs/operators';
import { NavController, AlertController, LoadingController } from '@ionic/angular';
import * as _ from 'lodash';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-purchase',
  templateUrl: './purchase.page.html',
  styleUrls: ['./purchase.page.scss'],
})
export class PurchasePage implements OnInit {

  product: any;
  loading = true;
  newStoreChargeRequest = {};
  storeChargeReference = {};
  user: any;
  chargeRequests: any = [];
  loadingShow: HTMLIonLoadingElement;

  constructor(
    private openpayService: OpenpayService,
    public navController: NavController,
    private purchasesService: PurchasesService,
    public toastService: ToastService,
    private storageService: StorageService,
    public loadingController: LoadingController,
    public alertController: AlertController) {
  }

  ngOnInit() {
    this.storageService.getItem('userData').then((userData) => {
      this.user = JSON.parse(userData);
      console.log(this.user);
      this.product = JSON.parse(localStorage.getItem('payNowReference'));

      // Set 15 day to make payment
      const due_date = new Date();
      due_date.setDate(due_date.getDate() + 15)

      this.newStoreChargeRequest = {
        method: 'store',
        amount: this.product.price || 1299,
        order_id: `${this.product.id}-${this.user.id}-${Math.floor(100000000 + Math.random() * 900000000)}`,
        due_date: due_date.toISOString(),
        description: this.product.description + ' turno de ' + this.product.round + '. El servicio será prestado en la parada ' + this.product.stopName + ' (' + this.product.stopDescription + ').',
        customer: {
          name: this.user.firstName,
          last_name: this.user.lastName || '',
          phone_number: this.user.phone || '',
          email: this.user.email
        },
        send_email: false,
        confirm: false
      };

      this.getSubscriptions();

    });
  }

  ionViewDidEnter() {
    // this.storeChargeRequest();
  }

  getSubscriptions() {
    this.loading = true;
    this.purchasesService.getCustomerChargeRequests(this.user.uid).pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    ).subscribe((chargeRequests: any) => {
      console.log(chargeRequests);
      this.chargeRequests = _.filter(chargeRequests, function (o) {
        return o.status !== "completed";
      });
      this.loading = false;
    })
  }

  payThisReference(reference: object) {
    localStorage.setItem('payNowReference', JSON.stringify(reference));
    this.navController.navigateForward('reference/purchase/payment');

  }

  isPastDue(due_date: string) {
    return new Date() > new Date(due_date) || false;
  }

  storeChargeRequest() {

    this.presentAlert(
      'Pago en tienda',
      'Hacer el pago en una tienda',
      'Al presionar el botón aceptar, se generará una referencia de pago válida por 15 días. ¿Generar referencia de pago?',
      'reference/purchase', this.product
    );
  }

  async presentAlert(header: string, subheader: string, message: string, navigateUrl: string, product: object) {
    const alert = await this.alertController.create({
      header: header,
      subHeader: subheader,
      message: message,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Aceptar',
          handler: () => {
            this.presentLoadingWithOptions().then(() => {
              this.openpayService.newStoreChargeRequest(this.newStoreChargeRequest, this.product, this.user).then((response) => {
                console.log(response);
                this.storeChargeReference = response;
                this.loadingShow.dismiss();
                this.loading = false;
              }).catch(err => {
                console.log(err);
                this.loadingShow.dismiss();
                this.toastService.presentToast(err, 3000, 'warning');
                this.loading = false;
              })
            })
          }
        }
      ]
    });

    await alert.present();
  }

  async presentLoadingWithOptions() {
    this.loadingShow = await this.loadingController.create({
      message: 'Creando referencia de pago, por favor espere ...',
      translucent: true
    });
    return await this.loadingShow.present();
  }



}
