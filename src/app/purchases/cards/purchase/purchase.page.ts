import { Component, OnInit } from '@angular/core';
import { LoadingController, AlertController, NavController, ToastController } from '@ionic/angular';
import { OpenpayService } from 'src/app/services/openpay/openpay.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { ErrorCodes } from 'src/app/services/openpay/error-codes';

declare var OpenPay: any;

@Component({
  selector: 'app-purchase',
  templateUrl: './purchase.page.html',
  styleUrls: ['./purchase.page.scss'],
})
export class PurchasePage implements OnInit {

  deviceSessionId: any;
  userData: any;
  product: any;
  token_id: any;
  errorCodes = ErrorCodes;
  newCardChargeRequest: any = {};
  card =
    {
      state: 'OFF',
      logo: "assets/img/visa.png",
      logo2: "assets/img/mastercard.png",
      logo3: "assets/img/american.png",
      a: 1234,
      b: 5522,
      c: 8432,
      d: 2264,
      expires: '',
      bank: 'CVV'
    };
  loading: HTMLIonLoadingElement;
  agreed = false;
  holderName = "";

  constructor(
    private storageService: StorageService,
    public toastController: ToastController,
    private navController: NavController,
    private openpayService: OpenpayService,
    public loadingController: LoadingController,
    public alertController: AlertController) {
    OpenPay.setId('mptiot2sftktydvpfgxj');
    OpenPay.setApiKey('pk_7dccea88359847118d24d3fefa8f8595');
    OpenPay.setSandboxMode(true);
    this.deviceSessionId = OpenPay.deviceData.setup("payment-form", "deviceIdHiddenFieldName");
    console.log(this.deviceSessionId);
    this.product = JSON.parse(localStorage.getItem('payNowReference'));
  }

  ngOnInit() {
    this.storageService.getItem('userData').then((userData) => {
      this.userData = JSON.parse(userData);
    });

    var form = (<HTMLFormElement>document.getElementById('payment-form'));

    form.addEventListener('submit', event => {
      event.preventDefault();
      console.log(event);
      // $("#pay-button").prop("disabled", true);
      this.presentLoadingWithOptions();
      OpenPay.token.extractFormAndCreate('payment-form', success_callbak, error_callbak);
    });

    var success_callbak = (response) => {
      console.log(response);
      this.token_id = response.data.id;
      var token_input = (<HTMLInputElement>document.getElementById('token_id'));
      token_input.setAttribute('value', this.token_id);
      console.log(formToJSON(form.elements));
      if (response.data.card.points_card) {
        // Si la tarjeta permite usar puntos, mostrar el cuadro de diálogo
        this.loading.dismiss().then(() => {
          this.presentAlertConfirm();
        });
      } else {
        // De otra forma, realizar el pago inmediatamente
        this.createCardCharge(false);
      }
    };

    var error_callbak = (response) => {
      this.loading.dismiss().then(() => {
        this.presentToastWithOptions(response);
      });
    };

    const formToJSON = elements => [].reduce.call(elements, (data, element) => {

      data[element.name] = element.value;
      return data;

    }, {});

  }

  async presentToastWithOptions(response: any) {
    console.log(response);
    const toast = await this.toastController.create({
      header: 'Error',
      message: `${response.data.error_code}: ${this.errorCodes[response.data.error_code]}`,
      position: 'bottom',
      color: 'danger',
      buttons: [
        {
          text: 'Ok',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    toast.present();
  }

  async presentLoadingWithOptions() {
    this.loading = await this.loadingController.create({
      spinner: 'crescent',
      message: 'Realizando el cargo',
      translucent: true
    });

    this.loading.onDidDismiss().then(() => {

    });

    return await this.loading.present();
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      header: 'Pagar con puntos',
      message: '¿Desea usar los <strong>puntos</strong> de su tarjeta para realizar este pago?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            this.presentLoadingWithOptions().then(() => {
              this.createCardCharge(false);
            })
          }
        }, {
          text: 'Sí',
          handler: () => {
            this.presentLoadingWithOptions().then(() => {
              this.createCardCharge(true);
            })
          }
        }
      ]
    });

    await alert.present();
  }

  async presentAlertConfirmPayment(response: any) {

    let header, message, buttons: any;

    if (response.status === 'completed') {
      header = 'Cargo realizado',
        message = `Se realizó un cargo por ${response.currency} ${response.amount} a su tarjeta ${response.card.brand} por concepto de ${response.description}`,
        buttons = [{
          text: 'Enterado',
          handler: () => {
            this.navController.navigateBack('purchases');
          }
        }]
    } else {
        header = 'No se pudo realizar el cargo',
        message = `error ${response.error_code}: ${this.errorCodes[response.error_code]}`,
        buttons = [{
          text: 'Aceptar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('user cancelled transaction');
          }
        }]
    }
    const alert = await this.alertController.create({
      header, message, buttons
    });

    await alert.present();
  }

  createCardCharge(useCardPoints: boolean) {
    this.newCardChargeRequest = {
      source_id: this.token_id,
      method: 'card',
      device_session_id: this.deviceSessionId,
      amount: this.product.price,
      currency: this.product.currency,
      order_id: `${this.product.id}-${this.userData.id}-${Math.floor(100000000 + Math.random() * 900000000)}`,
      description: this.product.description + ' turno de ' + this.product.round + '. El servicio será prestado en la parada ' + this.product.stopName + ' (' + this.product.stopDescription + ').',
      customer: {
        name: this.userData.firstName,
        last_name: this.userData.lastName,
        phone_number: this.userData.phone_number || '',
        email: this.userData.email
      }
    }
    if (useCardPoints) {
      this.newCardChargeRequest.use_card_points = true;
    }
    this.openpayService.newCardChargeRequest(this.newCardChargeRequest, this.product, this.userData).then((response: any) => {
      console.log(response);
      this.loading.dismiss().then(() => {
        this.presentAlertConfirmPayment(response);
      })
    })

  }

}
