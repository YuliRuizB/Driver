import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class ContactusService {

  aboutus: AngularFirestoreDocument;

  constructor(private afs: AngularFirestore) {
    this.aboutus = this.afs.collection('aboutus').doc('bus2u');
  }

  getAboutUsInfo() {
    this.aboutus = this.afs.collection('aboutus').doc('bus2u');
    return this.aboutus.snapshotChanges();
  }

  sendMessage(user: any, message: string) {
    let contactMessage = this.afs.collection('userMessages');
    user.message = message;
    user.messageStatus = 'new';
    return contactMessage.add(user);
  }
}
