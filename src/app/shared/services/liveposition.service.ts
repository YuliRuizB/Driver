import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, Subscription } from 'rxjs';
import { IPosition, ProgramService } from './program.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { GeoPoint, Timestamp } from 'firebase/firestore';
import { Geolocation, Geoposition, GeolocationOptions, PositionError } from '@awesome-cordova-plugins/geolocation/ngx';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LivepositionService {

  geolocationSubscription: Subscription;
  geolocationOptions: GeolocationOptions = {
    enableHighAccuracy: true,
    timeout: 3000
  };
  currentLocation: IPosition;
  geolocationWatchId: string;
  isLiveProgram: BehaviorSubject<any> = new BehaviorSubject(false);

  constructor( 
    private geolocation: Geolocation,
    private afs: AngularFirestore,
    private storage: Storage
  ) { 
    this.geolocationSubscription = this.geolocation.watchPosition().pipe(
      filter((position) => (position as Geoposition).coords !== undefined)
      ).subscribe((position: Geoposition) => {
        console.log(position.coords.longitude + ' ' + position.coords.latitude);
        this.currentLocation = position;
        this.updateLiveProgram(position);
    });
  }

  setLiveProgram(program: any) {
    console.log(program);
    this.storage.set('isLiveProgram', true);
    this.storage.set('liveProgramDocument', program.path + '/' + program.id);
    this.isLiveProgram.next(true);
  }

  unsetLiveProgram() {
    this.storage.set('isLiveProgram', false);
    this.storage.set('liveProgramDocument', null);
    this.isLiveProgram.next(false);
  }

  updateLiveProgram(position:IPosition) {

    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const geoPoint = new GeoPoint(latitude, longitude);
    const time = Timestamp.fromDate(new Date());

    this.storage.get('isLiveProgram').then( isLiveProgram => {
      if(isLiveProgram) {
        this.storage.get('liveProgramDocument').then( path => {
          if(!!path) {
            console.log('path is: ', path);
            this.afs.doc(path).update({
              date: time,
              lastUpdatedAt: time,
              geopoint: geoPoint
            });
          }
        })
      }
    })
  }
}
