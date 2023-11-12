import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class StopPointsService {

  stopPoints: AngularFirestoreCollection;
  stopPoint: AngularFirestoreDocument;

  constructor(private afs: AngularFirestore) { 
  }

  getRouteStopPoint(customerId: string, routeId: string) {
    this.stopPoints = this.afs.collection('customers').doc(customerId).collection('routes').doc(routeId).collection('stops', ref => ref.where('active','==',true));
    return this.stopPoints.snapshotChanges();
  }
}
