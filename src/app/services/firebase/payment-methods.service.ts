import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { IUserData } from 'src/app/models/models';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentMethodsService {

  paymentMethods: AngularFirestoreCollection;
  paymentMethod: AngularFirestoreDocument;

  constructor(private afs: AngularFirestore, private storageService: StorageService) { }
  
  getAllPaymentMethods(user: IUserData) {
    const customerDoc = this.afs.doc(`customers/${user.customerId}`);
    this.paymentMethods = customerDoc.collection('paymentMethods');
    return this.paymentMethods.snapshotChanges();
  }

  getActivePaymentMethods(user: IUserData) {
    this.paymentMethods = this.afs.collection('customers').doc(user.customerId).collection('paymentMethods', ref => ref.where('active', '==', true ));
    return this.paymentMethods.snapshotChanges();
  }

  getPaymentMethod(user: IUserData, id: string) {
    this.paymentMethod = this.afs.collection('customers').doc(user.customerId).collection('paymentMethods').doc(id);
    return this.paymentMethod.snapshotChanges();
  }

  getStores() {
    const participantStores = this.afs.collection('openpay_stores', ref => ref.where('active','==', true));
    return participantStores.snapshotChanges();
  }
}
