import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Subscription, Subject, BehaviorSubject } from 'rxjs';
import { MessagesService } from 'src/app/services/messages.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { IUserData } from 'src/app/models/models';
import { IonInfiniteScroll } from '@ionic/angular';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.page.html',
  styleUrls: ['./messages.page.scss'],
})
export class MessagesPage implements OnInit, OnDestroy {

  @ViewChild(IonInfiniteScroll, {static: true}) infiniteScroll: IonInfiniteScroll;

  messagesSub: Subscription;
  messages: any = [{id: 1, title: 'Mensaje de tu asesor de Bus2U', body: 'Gracias por tu mensaje, te informamos que tu pase de abordar ha sido corregido y ahora ya lo tienes disponible en tus pases', timestamp: 'acadsadcsdcas'}];
  notificationsSub: Subscription;
  notifications: any = [];
  loading = true;
  messageType = 'notifications';
  user: IUserData;
  limit$ = 50;

  constructor(private messagesService: MessagesService, private storageService: StorageService) { }

  ngOnInit() {
    this.storageService.getItem('userData').then( (userData) => {
      this.user = JSON.parse(userData);
      this.getSubscriptions();
    });
  }

  ngOnDestroy(): void {
    if(this.notificationsSub) {
      this.notificationsSub.unsubscribe();
    }
    if(this.messagesSub) {
      this.messagesSub.unsubscribe();
    }
  }

  getSubscriptions() {
    this.notificationsSub = this.messagesService.getNotifications(this.limit$).pipe(
      map(actions => actions.map (a => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return { id: id, ... data }
      })))
    .subscribe( notifications => {
      this.notifications = notifications;
      console.log(notifications);
      this.loading = false;
    });
    
    this.messagesSub = this.messagesService.getMessages(this.user, this.limit$).pipe(
      map(actions => actions.map (a => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return { id: id, ... data }
      })))
    .subscribe( messages => {
      this.messages = messages;
      console.log(messages);
      this.loading = false;
    });

  }

  loadNotificationsData(event) {
    this.limit$ = this.limit$ + 10;
    event.target.complete();
  }

  segmentChanged(ev: any) {
    // console.log('Segment changed', ev);
  }

}
