import { Component, OnInit } from '@angular/core';
import { UsersService } from '../services/firebase/users.service';
import { StorageService } from '../services/storage/storage.service';
import { IUserData } from '../models/models';
import { map } from 'rxjs/operators';
import { AlertController, IonItemSliding } from '@ionic/angular';
// import { FCM } from '@ionic-native/fcm/ngx';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})

export class NotificationsPage implements OnInit {

  remindersList: any = [];
  user: IUserData;
  translatedDays = {
    'sunday': 'Dom',
    'monday': 'Lun',
    'tuesday': 'Mar',
    'wednesday': 'Mié',
    'thursday': 'Jue',
    'friday': 'Vie',
    'saturday': 'Sáb'
  }

  constructor(/*private fcm: FCM, */public plt: Platform, private usersService: UsersService, private storageService: StorageService, public alertController: AlertController) {
    this.storageService.getItem('userData').then((userData) => {
      this.user = JSON.parse(userData);
      this.getSubscriptions();
    });
    this.plt.ready().then(() => {
      /*this.fcm.onTokenRefresh().subscribe(token => {
        this.usersService.registerToken(this.user.uid, token);
      });*/
    })
  }

  ngOnInit() {
  }

  getSubscriptions() {
    this.usersService.getReminders(this.user.uid).pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    ).subscribe((reminders) => {
      this.remindersList = reminders;
    })
  }

  moreOptions(slidingItem: IonItemSliding, reminder) {
    slidingItem.open('end').then(() => {
      console.log('opened', reminder);
    })
  }

  toggleActive(slidingItem: IonItemSliding, reminder) {
    reminder.active = !reminder.active;
    this.usersService.updateReminder(this.user.uid, reminder.id, reminder).then((response) => {
      console.log(response);
      if(reminder.active) {
        this.subscribeToTopic(reminder.stationId)
      } else {
        this.unsubscribeFromTopic(reminder.stationId)
      }
      slidingItem.close();
    })
  }

  subscribeToTopic(topic: string) {
    // this.fcm.subscribeToTopic(topic);
  }

  getToken() {
    /*this.fcm.getToken().then(token => {
      this.usersService.registerToken(this.user.uid, token);
    });*/
  }

  unsubscribeFromTopic(topic: string) {
    // this.fcm.unsubscribeFromTopic(topic);
  }

  async deleteReminder(slidingItem: IonItemSliding, reminder) {
    const alert = await this.alertController.create({
      header: 'Eliminar',
      message: '¿Estás seguro de <strong>eliminar</strong> este recordatorio?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
            slidingItem.close();
          }
        }, {
          text: 'Eliminar',
          handler: () => {
            this.usersService.deleteReminder(this.user.uid, reminder.id).then((response) => {
              console.log(response);
              slidingItem.close();
            })
          }
        }
      ]
    });

    await alert.present();
  }

}
