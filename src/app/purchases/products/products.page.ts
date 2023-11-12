import { Component, OnInit } from '@angular/core';
import { ActionSheetController, NavController, AlertController } from '@ionic/angular';
import { ProductsService } from 'src/app/services/firebase/products.service';
import { map } from 'rxjs/operators';
import { PaymentMethodsService } from 'src/app/services/firebase/payment-methods.service';
import { StorageService } from 'src/app/services/storage/storage.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
})
export class ProductsPage implements OnInit {

  products: any;
  paymentMethods: any;
  paymentMethodsButtons: any = [];
  loading = true;
  user: any;

  constructor(
    private alertController: AlertController,
    private actionSheetController: ActionSheetController,
    private navController: NavController,
    private productsService: ProductsService,
    private storageService: StorageService,
    private paymentMethodsService: PaymentMethodsService ) {
    
  }

  getSubscriptions() {
    this.loading = true;
    
    this.productsService.getActiveProducts(this.user).pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    ).subscribe((products) => {
      this.products = products;
      console.log(products);
      this.loading = false;
    })

    this.paymentMethodsService.getActivePaymentMethods(this.user).pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    ).subscribe((methods) => {
      this.paymentMethods = methods;
      methods.forEach( (method) => {
        const button = {
          text: method.name,
          icon: method.icon,
          handler: () => {
            console.log(method.name);
          }
        };
        this.paymentMethodsButtons.push(button);
      })
    })
  }


  ngOnInit() {
    this.storageService.getItem('userData').then( (userData) => {
      this.user = JSON.parse(userData);
      this.getSubscriptions();
    })
  }

  getProductDetails(product) {
    this.navController.navigateForward(`products/product-details/${product.id}`);
  }

  async presentActionSheet(product) {

    const actionSheet = await this.actionSheetController.create({
      header: 'Seleccionar método de pago',
      buttons: this.paymentMethodsButtons
    });
    await actionSheet.present();
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
            localStorage.setItem('purchase', JSON.stringify(product));
          this.navController.navigateForward(navigateUrl);
          }
        }
      ]
    });

    await alert.present();
  }

}
