import { Injectable } from '@angular/core';
import * as firebase from 'firebase/compat/app';
import { Record } from '@shared/classes/record';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class ActivityLogService {

  record: Record;

  constructor(private afs: AngularFirestore ) { }

  async recordActivity(event: any, currentLocation: any, program: any) {

    // console.log(event, currentLocation, program);

    let eventData = {
      name: event.type,
      description: event.message,
      currentLocation: !!currentLocation ? currentLocation : '',
      location: `${currentLocation.coords.latitude}, ${currentLocation.coords.longitude}`,
      code: event.code,
      format: 'QRCode',
      studentId: event.studentId,
      userId: event.uid,
      boardingPassId: event.boardingPassId,
      studentName: event.studentName,
      valid: event.isBoardingPassValid,
      isCredential: event.isCredential,
      credentialId: event.credentialId,
      validUsage: event.updateData || true,
      updateData: event.updateData || true,
      actualKey: event.actualKey,
      type: event.type,
      allowedOnBoard: event.allowedOnBoard,
      programId: program.id

    };
    // console.log(eventData);

    let newData: Record = new Record(program, eventData);
    this.updateActivity({ ...newData });
  }

  updateActivity(event) {
    console.log(event);
    
    const docId = this.afs.createId();
    const batch = firebase.default.firestore().batch();

    if(event.allowedOnBoard) {
      const increment = firebase.default.firestore.FieldValue.increment(1);
      const liveReportRef = firebase.default.firestore().collection('customers').doc(event.customerPath).collection('program').doc(event.programId); //dec 18 changed collection 'live' to program due to functions update.
      const date = firebase.default.firestore.Timestamp.fromDate(new Date());
      const locationArray = event.location.split(',');
      const geopoint = new firebase.default.firestore.GeoPoint(+locationArray[0], +locationArray[1]);
      batch.set(liveReportRef, { count: increment, lastUpdatedAt: date, geopoint }, {merge: true});
    }
    
    if( event.allowedOnBoard && !!event.boardingPassId) {
      const boardingPassRef = firebase.default.firestore().collection('users').doc(event.userId).collection('boardingPasses').doc(event.boardingPassId).collection('activityLog').doc(docId);
      batch.set(boardingPassRef, { ...event });
    }

    if( !!event.allowedOnBoard && !!event.isCredential && !!event.credentialId) {
      const boardingPassRef = firebase.default.firestore().collection('users').doc(event.userId).collection('credentials').doc(event.credentialId).collection('activityLog').doc(docId);
      batch.set(boardingPassRef, { ...event });
    }

    const activityRef = firebase.default.firestore().collection('activityLog').doc(docId);
    batch.set(activityRef, { ...event });
    return batch.commit()
      .then(() => console.log('batch write successful'))
      .catch((error) => console.log('error batch writing ...', error)
    );
  }
}
