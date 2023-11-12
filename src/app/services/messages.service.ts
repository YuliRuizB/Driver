import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { IUserData } from 'src/app/models/models';
import { StorageService } from './storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  notifications: any;
  messages: any;
  userCustomerId: any;
  userData: IUserData;

  constructor(private afs: AngularFirestore, private storageService: StorageService) { 
    // const userData: IUserData = JSON.parse(localStorage.getItem('userData'));
    this.storageService.getItem('userData').then( (userData) => {
      this.userData = JSON.parse(userData);
      this.userCustomerId = userData.customerId;
    });
  }
  
  getNotifications(limit: number) {
    const notifications = this.afs.collection("notifications", ref => 
      ref.orderBy("timestamp")
      .limit(limit));
    return notifications.snapshotChanges();
  }

  getNextNotifications(lastVisible: any, limit: number) {
    const notifications = this.afs.collection("notifications", ref => 
      ref.orderBy("timestamp")
      .startAfter(lastVisible)
      .limit(limit));
    return notifications.snapshotChanges();
  }

  getMessages(user: any, limit: number) {
    const messages = this.afs.collection("users").doc(user.uid).collection('messages', ref => 
      ref.orderBy("timestamp")
      .limit(limit));
    return messages.snapshotChanges();
  }

  getNextMessages(user: any, lastVisible: any, limit: number) {
    const messages = this.afs.collection("users").doc(user.uid).collection('messages', ref => 
      ref.orderBy("timestamp")
      .startAfter(lastVisible)
      .limit(limit));
    return messages.snapshotChanges();
  }
}
