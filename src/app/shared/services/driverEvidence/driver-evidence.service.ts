import { Injectable } from '@angular/core';
import * as firebase from 'firebase/compat/app';
import { Record } from '@shared/classes/record';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class DriverEvidenceService {

  constructor(private afs: AngularFirestore) { }



	insertDriverEvidenceInside(data, urlImage, urlAudio) {
		const fire1= this.afs;
		const fire2 = this.afs;

    return new Promise ((resolve,reject)=>{
      fire1.collection('drivers').doc(data.uid).collection('driversEvidence').add({  
				idDoc: '',
				uid: data.uid,
				displayName: data.displayName,
				userName: data.userName,
				lastName: data.lastName,
				email: data.email,
				employeeId: data.employeeId,
				customerId: data.customerId,
				programId: data.programId,
				routeId: data.routeId,
				dateTimeId: data.dateTimeId,
				dateTime: data.dateTime,
				date: data.date,
				dateFormat: data.dateFormat,
				dateTimeStamp: new Date(data.dateFormat),
				imageUrl: urlImage,
				audioUrl: urlAudio,
				comentario: data.comentario
      }).then(function(dataAux)  {
				fire2.collection('drivers').doc(data.uid).collection('driversEvidence').doc(dataAux.id).update({
					idDoc: dataAux.id
				}).then(function(data) {
				 resolve(true);
				}).catch(function(error) {
					console.log(error)
				 resolve(false)
				});
				// resolve(true)
			}).catch(function(error) {
        console.log("Error getting document:", error);
				resolve(false)
      });
    });
	}

	insertDriverEvidenceRoot(data, urlImage, urlAudio) {
		const fire1= this.afs;
		const fire2 = this.afs;
    return new Promise ((resolve,reject)=>{
      fire1.collection('driversEvidence').add({  
				idDoc: '',
				uid: data.uid,
				displayName: data.displayName,
				userName: data.userName,
				lastName: data.lastName,
				email: data.email,
				employeeId: data.employeeId,
				customerId: data.customerId,
				programId: data.programId,
				routeId: data.routeId,
				dateTimeId: data.dateTimeId,
				dateTime: data.dateTime,
				date: data.date,
				dateFormat: data.dateFormat,
				dateTimeStamp: new Date(data.dateFormat),
				imageUrl: urlImage,
				audioUrl: urlAudio,
				comentario: data.comentario
      }).then(function(dataAux)  {
				fire2.collection('driversEvidence').doc(dataAux.id).update({
					idDoc: dataAux.id
				}).then(function(data) {
				 resolve(true);
				}).catch(function(error) {
				 resolve(false)
				});
				// resolve(true)
			}).catch(function(error) {
        console.log("Error getting document:", error);
				resolve(false)
      });
    });
	}
}
