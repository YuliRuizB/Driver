import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { IUserData } from 'src/app/models/models';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class StopPointsService {

  stopPoints: AngularFirestoreCollection;
  stopPoint: AngularFirestoreDocument;

  constructor(private afs: AngularFirestore, private storageService: StorageService) { 
  }
  
  getAllStopPoints(user: IUserData) {
    const customerDoc = this.afs.doc(`customers/${user.customerId}`);
    this.stopPoints = customerDoc.collection('stopPoints');
    return this.stopPoints.snapshotChanges();
  }

  getActiveStopPoints(user: IUserData) {
    this.stopPoints = this.afs.collection('customers').doc(user.customerId).collection('stopPoints', ref => ref.where('active', '==', true ));
    return this.stopPoints.snapshotChanges();
  }

  getStopPoint(user: IUserData, id: string) {
    this.stopPoint = this.afs.collection('customers').doc(user.customerId).collection('stopPoints').doc(id);
    return this.stopPoint.snapshotChanges();
  }
}
