import { Injectable } from '@angular/core';
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { Device } from '@awesome-cordova-plugins/device/ngx';
import { PurchasesService } from '../firebase/purchases.service';
import * as firebase from 'firebase/compat';
import { Timestamp } from 'firebase/firestore';
import { AngularFirestore } from '@angular/fire/compat/firestore';
declare var OpenPay: any;

@Injectable({
  providedIn: 'root'
})
export class OpenpayService {

  // API_URL = 'https://api.openpay.mx'; //Production
  // // API_URL = 'https://sandbox-api.openpay.mx'; //Sandbox
  // VERSION = 'v1';
  // // ID = 'm2mkwvsgfxzuc0hrg8fm'; //Production
  // ID = 'mptiot2sftktydvpfgxj'; //Sandbox
  // // PUBLIC_TOKEN = 'pk_150d4fa44c244826b47bb08b19cc5cfb'; //Production
  // PUBLIC_TOKEN = 'pk_7dccea88359847118d24d3fefa8f8595'; //Sandbox
  // SANDBOX_MODE = false;

  API_URL = '';
  VERSION = '';
  ID = '';
  PUBLIC_TOKEN = '';
  SANDBOX_MODE: boolean = false;
  DEVICE: any;

  constructor( private afs: AngularFirestore, private aff: AngularFireFunctions, private device: Device, private purchasesService: PurchasesService) {
    
    this.afs.collection('openpay_keys').doc('currentKeys').valueChanges().subscribe( (data: any) => {
      this.API_URL = data.apiUrl;
      this.VERSION = data.version;
      this.ID = data.merchantId;
      this.PUBLIC_TOKEN = data.publicToken;
      this.SANDBOX_MODE = data.sandboxMode;
      OpenPay.setId(this.ID);
      OpenPay.setApiKey(this.PUBLIC_TOKEN);
      OpenPay.setSandboxMode(this.SANDBOX_MODE);
      this.DEVICE = this.device.uuid;
      console.log(this.DEVICE);
      console.log(data);
    })
    
  }

  newOpenpayToken(charge: object) {

    OpenPay.token.create({
      "card_number": "4111111111111111",
      "holder_name": "Juan Perez Ramirez",
      "expiration_year": "20",
      "expiration_month": "12",
      "cvv2": "110",
      "address": {
        "city": "Querétaro",
        "line3": "Queretaro",
        "postal_code": "76900",
        "line1": "Av 5 de Febrero",
        "line2": "Roble 207",
        "state": "Queretaro",
        "country_code": "MX"
      }
    }, onSuccess, onError);
  }

  newOpenpayCustomer(customerRequest: object) {
    console.log('request received: ', customerRequest);
    let newOpenpayCustomer = customerRequest;
    const addNewOpenpayCustomer = this.aff.httpsCallable('addNewOpenpayCustomer');
    addNewOpenpayCustomer(newOpenpayCustomer).toPromise().then((response) => {
      console.log(response);
      return response;
    }).catch((err) =>
      console.error('error', err)
    );
  }

  newCardChargeRequest(cardChargeRequest: object, product: any, user: any) {
    const addNewCardChargeRequest = this.aff.httpsCallable('addNewOpenpayCardChargeRequest');
    return addNewCardChargeRequest({ charge_request: cardChargeRequest }).toPromise().then((response: any) => {
      console.log(response);
      if( response && response.status == 'completed') {
      const chargeRequestProduct = {
        id: response.id,
        authorization: response.authorization,
        operation_type: response.operation_type,
        method: response.method,
        transaction_type: response.transaction_type,
        card:
        {
          type: response.card.type,
          brand: response.card.brand,
          address: response.card.address || '',
          card_number: response.card.card_number,
          holder_name: response.card.holder_name,
          expiration_year: response.card.expiration_year,
          expiration_month: response.card.expiration_month,
          allows_charges: response.card.allows_charges,
          allows_payouts: response.card.allows_payouts,
          bank_name: response.card.bank_name,
          bank_code: response.card.bank_code,
          points_card: response.card.points_card || '',
          points_type: response.card.points_type || '',
        },
        status: 'awaiting confirmation',
        conciliated: response.conciliated,
        creation_date: response.creation_date,
        operation_date: response.operation_date,
        description: response.description,
        error_message: response.error_message,
        order_id: response.order_id,
        currency: response.currency,
        amount: response.amount,
        customer:
        {
          name: response.customer.name,
          last_name: response.customer.last_name,
          email: response.customer.email,
          phone_number: response.customer.phone_number,
          address: response.customer.address,
          creation_date: response.customer.creation_date,
          external_id: response.customer.external_id,
          clabe: response.customer.clabe
        },
        active: true,
        category: product.category,
        date_created: new Timestamp(product.date_created.seconds, product.date_created.nanoseconds),
        product_description: product.description,
        product_id: product.id,
        name: product.name,
        isTaskIn: product.isTaskIn || false,
        isTaskOut: product.isTaskOut || false,
        type: product.type || '',
        isOpenpay: true,
        paidApp: 'user',
        price: product.price,
        round: product.round,
        routeId: product.routeId,
        routeName: product.routeName,
        stopDescription: product.stopDescription,
        stopId: product.stopId,
        stopName: product.stopName,
        validFrom: new Timestamp(product.validFrom.seconds, product.validFrom.nanoseconds),
        validTo: new Timestamp(product.validTo.seconds, product.validTo.nanoseconds),
        is_courtesy: false
      }
      console.log(chargeRequestProduct);
      this.createChargeRequestWithProduct(user.uid, chargeRequestProduct);
    }
      return response;
    })
  }

  newStoreChargeRequest(storeChargeRequest: object, product: any, user: any) {
    console.log('request received: ', storeChargeRequest);
    console.log('product', product);
    let newStoreChargeRequest = storeChargeRequest;
    // const shavedUserId = userId.substring(0, 4);
    const addNewStoreChargeRequest = this.aff.httpsCallable('addNewOpenpayStoreChargeRequest');
    return addNewStoreChargeRequest({ charge_request: newStoreChargeRequest }).toPromise().then((response: any) => {
      console.log(response);

      const chargeRequestProduct = {
        id: response.id,
        authorization: response.authorization,
        operation_type: response.operation_type,
        method: response.method,
        transaction_type: response.transaction_type,
        status: response.status,
        conciliated: response.conciliated,
        creation_date: response.creation_date,
        operation_date: response.operation_date,
        description: response.description,
        error_message: response.error_message,
        order_id: response.order_id,
        due_date: response.due_date,
        payment_method: {
          type: response.payment_method.type,
          reference: response.payment_method.reference,
          barcode_url: response.payment_method.barcode_url
        },
        currency: response.currency,
        amount: response.amount,
        customer: {
          name: response.customer.name,
          last_name: response.customer.last_name,
          email: response.customer.email,
          phone_number: response.customer.phone_number,
          address: response.customer.address,
          creation_date: response.customer.creation_date,
          external_id: response.customer.external_id,
          clabe: response.customer.clabe
        },
        active: true,
        category: product.category,
        date_created: new Timestamp(product.date_created.seconds, product.date_created.nanoseconds),
        product_description: product.description,
        product_id: product.id,
        name: product.name,
        price: product.price,
        round: product.round,
        routeId: product.routeId,
        routeName: product.routeName,
        stopDescription: product.stopDescription,
        stopId: product.stopId,
        stopName: product.stopName,
        validFrom: new Timestamp(product.validFrom.seconds, product.validFrom.nanoseconds),
        validTo: new Timestamp(product.validTo.seconds, product.validTo.nanoseconds),
        isTaskIn: product.isTaskIn || false,
        isTaskOut: product.isTaskOut || false,
        type: product.type || '',
        isOpenpay: true,
        paidApp: 'user',
        is_courtesy: false
      }
      this.createChargeRequestWithProduct(user.uid, chargeRequestProduct);
      return response;
    }).catch((err) =>
      console.error('error', err)
    );
  }

  createChargeRequestWithProduct(uid: string, request: object) {
    this.purchasesService.setCustomerChargeRequest(uid, request);
    console.log(request);
  }

}

function onSuccess(response?: any) {
  alert('Successful operation');
  console.log(response);
  var content = '', results = document.getElementById('resultDetail');
  content += 'Id card: ' + response.data.id + '<br />';
  content += 'Holder Name: ' + response.data.holder_name + '<br />';
  content += 'Card brand: ' + response.data.brand + '<br />';
  console.log(content);
}

function onError(response?: any) {
  alert('Fallo en la transacción');
  var content = '', results = document.getElementById('resultDetail');
  content += 'Estatus del error: ' + response.data.status + '<br />';
  content += 'Error: ' + response.message + '<br />';
  content += 'Descripción: ' + response.data.description + '<br />';
  content += 'ID de la petición: ' + response.data.request_id + '<br />';
  console.log(content);
}