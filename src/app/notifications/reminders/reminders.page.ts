import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { StorageService } from 'src/app/services/storage/storage.service';
import { IUserData } from 'src/app/models/models';
import { UsersService } from 'src/app/services/firebase/users.service';
import { ToastController, NavController, ModalController } from '@ionic/angular';
import { StopsListPage } from '../stops-list/stops-list.page';
// import { FcmService } from 'src/app/services/fcm.service';

@Component({
  selector: 'app-reminders',
  templateUrl: './reminders.page.html',
  styleUrls: ['./reminders.page.scss'],
})
export class RemindersPage implements OnInit {

  reminderForm: FormGroup;
  user: IUserData;

  constructor( public modalController: ModalController, public navController: NavController, private fb: FormBuilder, private storageService: StorageService, public toastController: ToastController, private usersService: UsersService) {

    this.storageService.getItem('userData').then( (userData) => {
      this.user = JSON.parse(userData);
    });

    this.reminderForm = fb.group({
      routeId: ['', Validators.compose([Validators.required])],
      routeName:['', Validators.compose([Validators.required])],
      stationId: ['', Validators.compose([Validators.required])],
      stationName: ['', Validators.compose([Validators.required])],
      stationDescription: ['', Validators.compose([Validators.required])],
      round: ['', Validators.compose([Validators.required])],
      minutes: ['', Validators.compose([Validators.required])],
      days: ['', Validators.compose([Validators.required])],
      active: [true]
    });

   }

  ngOnInit() {
    // this.getPermission();
  }

  getPermission() {
    // this.fcmService.getPermission().subscribe();
  }

  setReminder() {
    console.log('set reminder');
    console.log(this.reminderForm.value);
    const reminder = this.reminderForm.value;
    if(this.reminderForm.valid) {
      this.subscribeToTopic(reminder.stationId);
    }
  }

  async presentToast() {
    const toast = await this.toastController.create({
      message: 'El recordatorio ha sido guardado.',
      duration: 2000,
      color: 'primary',
      position: 'middle',
      animated: true
    });
    toast.onDidDismiss().then( () => {
      this.navController.pop();
    })
    toast.present();
  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: StopsListPage,
      componentProps: {
      }
    });

    modal.onWillDismiss().then(stopPoint => {
      const stopPointSelected = stopPoint.data.data;
      console.log(stopPointSelected);
      this.reminderForm.controls['stationName'].setValue(stopPointSelected.name);
      this.reminderForm.controls['stationId'].setValue(stopPointSelected.id);
      this.reminderForm.controls['stationDescription'].setValue(stopPointSelected.description);
      this.reminderForm.controls['routeId'].setValue(stopPointSelected.routeId);
      this.reminderForm.controls['routeName'].setValue(stopPointSelected.routeName);
      console.log(this.reminderForm.value);
    })

    return await modal.present();
  }

  subscribeToTopic(topic: string) {
    // this.fcmService.sub(topic);
    //   this.usersService.setReminder(this.user.uid, this.reminderForm.value).then( (response) => {
    //     this.presentToast();
    //   });
  }

}
