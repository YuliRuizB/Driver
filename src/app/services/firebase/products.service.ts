import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { IUserData } from 'src/app/models/models';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  products: AngularFirestoreCollection;
  product: AngularFirestoreDocument;
  userCustomerId: any;
  userData: IUserData;

  constructor(private afs: AngularFirestore, private storageService: StorageService) { 
    // const userData: IUserData = JSON.parse(localStorage.getItem('userData'));
    this.storageService.getItem('userData').then( (userData) => {
      this.userData = JSON.parse(userData);
      this.userCustomerId = userData.customerId;
    });
  }
  
  getAllProducts(user: any) {
    const customerDoc = this.afs.doc(`customers/${user.customerId}`);
    this.products = customerDoc.collection('products');
    return this.products.snapshotChanges();
  }

  getActiveProducts(user: any) {
    this.products = this.afs.collection('customers').doc(user.customerId).collection('products', ref =>
      ref.where('active','==', true).orderBy('date_created', 'desc')
    );
    return this.products.snapshotChanges();
  }

  getProduct(user: any, id: string) {
    this.product = this.afs.collection('customers').doc(user.customerId).collection('products').doc(id);
    return this.product.snapshotChanges();
  }
}
