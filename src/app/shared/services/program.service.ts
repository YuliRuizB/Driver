import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ToastController } from '@ionic/angular';
import * as firebase from 'firebase/app';
import { Geolocation, Geoposition } from '@awesome-cordova-plugins/geolocation/ngx';
import { filter } from 'rxjs/operators';
import { startOfDay, endOfToday, startOfTomorrow } from 'date-fns';
import { GeoPoint, Timestamp } from 'firebase/firestore';

export const enum Updates {
  confirm, 
  setLive,
  reject,
  end,
  problem,
  okNow,
  unitFull
}

export class IPosition {
  coords: {
    latitude: number,
    longitude: number,
  };
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProgramService {

  user: any;
  geolocationSubscription: Subscription;
  currentLocation: any;
  public pCurrentLocation: BehaviorSubject<IPosition> = new BehaviorSubject(null);
  
  constructor(private authService: AuthService, private afs: AngularFirestore, public toastController: ToastController, private geolocation: Geolocation) {
    this.authService.user_profile.subscribe( (data) => {
      this.user = data;
    })
    this.geolocationSubscription = this.geolocation.watchPosition().pipe(
      filter((position) => (position as Geoposition).coords !== undefined),
      ).subscribe((position: Geoposition) => {
        this.pCurrentLocation.next(position);
        console.log(position.coords.longitude + ' ' + position.coords.latitude);
        this.currentLocation = position;
    });
  }

  stopWatchPosition() {
    if(this.geolocationSubscription) {
      this.geolocationSubscription.unsubscribe();
    }
  }

  getTodayActivePrograms(userId: string) {

    const today = startOfDay(new Date());
    const tomorrow = startOfTomorrow();
    const activePrograms = this.afs.collectionGroup('program', ref => 
      ref.where('driverId', '==', userId)
      .where('startAt','>=',today)
      .where('startAt','<',tomorrow)
      .orderBy('startAt','asc')
      // .where('hasEnded','==',false)
    );
		return activePrograms.snapshotChanges();
  }

  getProgramAfterToday(userId: string) {
    const today = endOfToday();
    const program = this.afs.collectionGroup('program', ref => 
      ref.where('driverId','==', userId)
      .where('startAt','>', today)
      .orderBy('startAt', 'asc')
    );
    return program.snapshotChanges();
  } 

  getProgram(customerId: string, programId: string) {
    const program = this.afs.collection('customers').doc(customerId).collection('program').doc(programId);
    return program.snapshotChanges();
  }

  getProgramActivityLog(programId: string) {
    const currentProgramActivityLog = this.afs.collection('activityLog', ref => ref.where('programId','==',programId));
    return currentProgramActivityLog.snapshotChanges();
  }

  updateProgram( updateCase: Updates, customerId: string, programId: string, additionalDescription?: string, troubleType?: string, additionalFields?: any) {

    /* enum available cases: 'confirm', 'setLive', 'reject','end','problem','okNow','unitFull' */
    let update:any = {
      geopoint: new GeoPoint(this.currentLocation.coords.latitude, this.currentLocation.coords.longitude),
      lastUpdatedAt: Timestamp.fromDate(new Date())
    };
    switch (updateCase) {
      case Updates.confirm:
        update.isConfirmed = true;
        update.isRejected = false;
        update.isWithTrouble = false;
        update.driverConfirmedAt = Timestamp.fromDate(new Date())
        break;
      case Updates.unitFull:
        update.isFull = true;
        update.troubleType = troubleType;
        break;
      case Updates.setLive:
        update.isLive = true;
        update.started = true;
        update.hasEnded = false;
        update.isRejected = false;
        update.isWithTrouble = false;
        update.startedAt = Timestamp.fromDate(new Date());
        // set localValue to get all Geopoints at live time.
        break;
      case Updates.reject:
        update.isRejected = true;
        update.isConfirmed = false;
        update.rejectedReason = additionalDescription || 'operador no agregó información del rechazo.';
        update.troubleType = troubleType || 'general';
        break;
      case Updates.end:
        update.hasEnded = true;
        update.isLive = false;
        update.endedAt = Timestamp.fromDate(new Date());
        update.checkList = additionalFields || null
        break;
      case Updates.problem:
        update.isWithTrouble = true;
        update.isConfirmed = false;
        update.isRejected = false;
        update.troubleMessage = additionalDescription || 'Operador no agregó información del problema.'
        update.troubleType = troubleType || 'general';
        break;
      case Updates.okNow:
        update.isRejected = false;
        update.isWithTrouble = false;
        update.troubleMessage = null;
        update.troubleType = null;
      default:
        break;
    }
    const customerProgram = this.afs.collection('customers').doc(customerId).collection('program');
    const program = customerProgram.doc(programId);
    
    program.update(update).then( (success) => {
      this.presentToast('Se ha actualizado la información',3000,'success');
    }, err => {
      console.log(err);
      this.presentToast(`Ha habido un problema ${err.message}`,3000,'danger')
    });
  }

  async presentToast(message: string, duration: number, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: duration || 3000,
      position: 'top',
      color
    });
    toast.present();
  }
}


/*
active: true
capacity: 39
count: 0
customerId: "2SneRDolNMtXg4DIuIfN"
customerName: "Prepa 2"
driver: "Ernesto Vallejo"
driverConfirmationAt: March 11, 2020 at 5:45:00 AM UTC-6
driverConfirmedAt: March 13, 2020 at 5:10:23 PM UTC-6
driverId: "vM72tpSYP4Zgvb7ligJkqa38IJG2"
endAt: March 11, 2020 at 7:45:00 AM UTC-6
endedAt: March 11, 2020 at 12:00:00 AM UTC-6
geofenceBegin: [25° N, 100° W]
geofenceEnd: [25.1° N, 99.9° W]
geopoint: [25.7657° N, 100.2159° W]
hasEnded: false
isConfirmed: true
isLive: true
isRejected: false
isTaskIn: true
isTaskOut: false
isWithTrouble: false
lastUpdatedAt: March 13, 2020 at 5:10:33 PM UTC-6
name: "Escobedo"
program: "M"
rating: 0
rejectedReason: "Estoy enfermo"
round: "Tarde"
routeDescription: "Escobedo"
routeId: "4fi7YZTxI4gG95So16vj"
routeName: "Escobedo"
startAt: March 11, 2020 at 6:00:00 AM UTC-6
started: false
startedAt: March 11, 2020 at 6:00:00 AM UTC-6
troubleMessage: null
troubleType: "driver_sickness"
type: "M"
vehicleId: "2341234123413"
vehicleName: "2773E"
*/