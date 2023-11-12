import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import * as firebase from 'firebase/compat/app';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  users: AngularFirestoreCollection;
  user: AngularFirestoreDocument;

  constructor(private afs: AngularFirestore, private fbStorage: AngularFireStorage) {
    this.users = this.afs.collection('users');
  }

  getUser(uid: string) {
    const user = this.afs.collection('users').doc(uid);
    return user.snapshotChanges();
  }

  registerToken(uid: string, token: string) {
    console.log('got a new token for ', uid, ', token is: ', token);
    const user = this.afs.collection('users').doc(uid);
    return user.update({
      token: token
    });
  }

  registerAPNSToken(uid: string, token: string) {
    console.log('got a new token for ', uid, ', token is: ', token);
    const user = this.afs.collection('users').doc(uid);
    return user.update({
      apnsToken: token
    });
  }

  updateUserPreference(uid: string, preference: object) {
    console.log('will save db preference: ', uid, preference);
    const user = this.users.doc(uid);
    return user.update(preference);
  }

  uploadImage(imageURI) {
    return new Promise<any>((resolve, reject) => {
      let storageRef = firebase.default.storage().ref();
      let imageRef = storageRef.child('image').child('imageName');
      this.encodeImageUri(imageURI, function (image64) {
        imageRef.putString(image64, 'data_url')
          .then(snapshot => {
            resolve(snapshot.ref.getDownloadURL)
          }, err => {
            reject(err);
          })
      })
    })
  }

  encodeImageUri(imageUri, callback) {
    var c = document.createElement('canvas');
    var ctx = c.getContext("2d");
    var img = new Image();
    img.onload = function () {
      var aux: any = this;
      c.width = aux.width;
      c.height = aux.height;
      ctx.drawImage(img, 0, 0);
      var dataURL = c.toDataURL("image/jpeg");
      callback(dataURL);
    };
    img.src = imageUri;
  }

  setReminder(uid: string, reminder: any) {
    const remindersRef = this.users.doc(uid).collection('reminders');
    return remindersRef.add(reminder);
  }

  getReminders(uid: string) {
    const remindersRef = this.users.doc(uid).collection('reminders');
    return remindersRef.snapshotChanges();
  }

  updateReminder(uid: string, doc: string, reminder: any) {
    const reminderDoc = this.users.doc(uid).collection('reminders').doc(doc);
    return reminderDoc.update(reminder);
  }

  deleteReminder(uid: string, doc: string) {
    const reminderDoc = this.users.doc(uid).collection('reminders').doc(doc);
    return reminderDoc.delete();
  }


}
