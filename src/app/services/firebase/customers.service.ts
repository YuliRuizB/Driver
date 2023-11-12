import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class CustomersService {

  customers: AngularFirestoreCollection;

  constructor(private afs: AngularFirestore) {
    this.customers = this.afs.collection('customers');
   }

   getCustomersPublicList() {
    this.customers = this.afs.collection('pCustomers', ref => ref.where('active', '==', true).orderBy('name','asc'));
    return this.customers.snapshotChanges();
   }
}
