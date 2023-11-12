import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class PurchasesService {

  purchases: AngularFirestoreCollection;
  chargeRequests: AngularFirestoreCollection;

  constructor(private afs: AngularFirestore, private storageService: StorageService) {
    
  }

  getCustomerPurchases(uid: string, limit?: number) {
    this.purchases =  this.afs.collection(`users/${uid}/boardingPasses`, ref => 
      ref.limit(limit || 5)
    );
    return this.purchases.snapshotChanges();
  }

  getCustomerActivePurchases(uid: string) {
    this.purchases =  this.afs.collection(`users/${uid}/boardingPasses`, ref => 
      ref.orderBy('validTo', 'desc').where('active','==', true)
    );
    return this.purchases.snapshotChanges();
  }

  getBoardingPassActivityLog(uid: string, boardingPassId: string) {
    const boardingPassActivityLog = this.afs.collection(`users/${uid}/boardingPasses`).doc(boardingPassId).collection('activityLog', ref =>
    ref.orderBy('created','asc'));
    return boardingPassActivityLog.valueChanges();
  }

  getCustomerChargeRequest(uid: string, orderId: string) {
    this.chargeRequests = this.afs.collection('users').doc(uid).collection('purchaseRequests', ref => ref.where('order_id', '==', orderId));
    return this.chargeRequests.snapshotChanges();
  }

  getCustomerChargeRequests(uid: string) {
    this.chargeRequests = this.afs.collection('users').doc(uid).collection('purchaseRequests', ref => ref.orderBy('creation_date','desc'));
    return this.chargeRequests.snapshotChanges();
  }

  getCustomerActiveChargeRequests(uid: string) {
    let today = new Date();
    this.chargeRequests = this.afs.collection('users').doc(uid).collection('purchaseRequests', ref => ref.where('status','==', 'in_progress').orderBy('due_date','desc'));
    return this.chargeRequests.snapshotChanges();
  }

  getLastCustomerChargeRequests(uid: string) {
    this.chargeRequests = this.afs.collection('users').doc(uid).collection('purchaseRequests', ref => ref.orderBy('due_date','desc').limit(1));
    return this.chargeRequests.snapshotChanges();
  }

  setCustomerChargeRequest(uid: string, chargeRequest: any) {
    console.log(chargeRequest);
    let chargeRequestDoc = this.afs.collection('users').doc(uid).collection('purchaseRequests').doc(chargeRequest.id);
    return chargeRequestDoc.set(Object.assign({}, chargeRequest));


  }
}
