import { Component, OnInit, OnDestroy } from '@angular/core';
import { PurchasesService } from 'src/app/services/firebase/purchases.service';
import { map } from 'rxjs/operators';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { StorageService } from 'src/app/services/storage/storage.service';
import { IUserData } from 'src/app/models/models';
import { ToastService } from 'src/app/services/toast.service';
import { OpenpayService } from 'src/app/services/openpay/openpay.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit, OnDestroy {

  purchaseRequests: any = [];
  newStoreChargeRequest = {};
  storeChargeReference = {};
  loading = true;
  product: any;
  user: IUserData;
  loadingShow: HTMLIonLoadingElement;

  constructor(private purchasesService: PurchasesService,
    private storageService: StorageService,
    private openpayService: OpenpayService,
    public navController: NavController,
    public toastService: ToastService,
    public loadingController: LoadingController,
    public alertController: AlertController
  ) { }

  ngOnInit() {
    console.log('onInit');
    this.storageService.getItem('userData').then((userData) => {
      this.user = JSON.parse(userData);
      this.product = JSON.parse(localStorage.getItem('payNowReference'));

      if (this.product != undefined) {
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
      }
      console.log(this.newStoreChargeRequest);
      this.getSubscriptions();
      // this.storeChargeRequest();
    })
  }

  ngOnDestroy() {
    if (!!this.product) {
      this.product.active = false;
      localStorage.setItem('payNowReference', JSON.stringify(this.product));
      console.log('onDestroy');
    }
  }

  getSubscriptions() {

    this.purchasesService.getCustomerActiveChargeRequests(this.user.uid).pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    ).subscribe((products) => {
      this.purchaseRequests = products;
      console.log(products);
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

    if (!!this.product && this.product.active) {
      this.presentAlert(
        'Pago en tienda',
        'Hacer el pago en una tienda',
        'Al presionar el botón aceptar, se generará una referencia de pago válida por 15 días. ¿Generar referencia de pago?',
        'reference/purchase', this.product
      );
    }
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
