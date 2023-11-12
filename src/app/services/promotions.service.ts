import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { IUserData } from 'src/app/models/models';
import { StorageService } from './storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class PromotionsService {

  promotions: AngularFirestoreCollection;
  promotion: AngularFirestoreDocument;
  userCustomerId: any;
  userData: IUserData;

  constructor(private afs: AngularFirestore, private storageService: StorageService) { 
    // const userData: IUserData = JSON.parse(localStorage.getItem('userData'));
    this.storageService.getItem('userData').then( (userData) => {
      this.userData = JSON.parse(userData);
      this.userCustomerId = userData.customerId;
    });
  }
  
  getAllPromotions(user: any) {
    const customerDoc = this.afs.doc(`customers/${user.customerId}`);
    this.promotions = customerDoc.collection('promotions');
    return this.promotions.snapshotChanges();
  }

  getActivePromotions(user: any) {
    this.promotions = this.afs.collection('customers').doc(user.customerId).collection('promotions', ref =>
      ref.where('active','==', true).orderBy('date_created', 'desc')
    );
    return this.promotions.snapshotChanges();
  }

  getPromotion(user: any, id: string) {
    this.promotion = this.afs.collection('customers').doc(user.customerId).collection('promotions').doc(id);
    return this.promotion.snapshotChanges();
  }
}
