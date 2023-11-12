import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import * as firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})

export class VendorService {

  vendors: AngularFirestoreCollection;

  constructor(private afs: AngularFirestore) {
    this.vendors = this.afs.collection('vendors');
   }

   getVendorsPublicList() {
    this.vendors = this.afs.collection('vendors', ref => ref.where('active', '==', true).orderBy('name','asc'));
    return this.vendors.snapshotChanges();
   }
}
