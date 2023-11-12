import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Injectable({
  providedIn: 'root'
})
export class ShareService {

  customer: AngularFirestoreDocument;
  shareSettings: AngularFirestoreDocument;
  

  constructor(private afs: AngularFirestore, private fbStorage: AngularFireStorage) {

  }

  getShareSettings( customerId: string) {
    const shareSettingsRef = this.afs.collection('customers').doc(customerId).collection('shareSettings');
    return shareSettingsRef.snapshotChanges();
  }

  getActiveShareSettings(customerId: string) {
    const activeShareSettingsRef = this.afs.collection('customers').doc(customerId).collection('shareSettings', ref => ref.where('active', '==', true));
    return activeShareSettingsRef.snapshotChanges();
  }

  setParentsReference(user: any, referenceCode: number) {
    const shareRef = this.afs.collection('shareReferences');
    let reference = {
      [referenceCode]: user.uid,
      valid: true,
      activated: false
    };
    return shareRef.add(reference);
    
  }

  getParents(userId: string) {
    const parents = this.afs.collection('users').doc(userId).collection('parents');
    return parents.snapshotChanges();
  }

  toggleParent(userId: string, parentId: string, value: boolean) {
    const toggle = this.afs.collection('users').doc(userId).collection('parents').doc(parentId);
    return toggle.update({
      canGetNotifications: !value
    });
  }

}
