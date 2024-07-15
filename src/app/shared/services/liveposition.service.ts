import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { IPosition, ProgramService } from './program.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { GeoPoint, Timestamp } from 'firebase/firestore';
import { Geolocation, Geoposition, GeolocationOptions, PositionError } from '@awesome-cordova-plugins/geolocation/ngx';
import { filter } from 'rxjs/operators';
import { BackgroundMode } from '@ionic-native/background-mode/ngx';
import * as moment from 'moment';
@Injectable({
  providedIn: 'root'
})
export class LivepositionService {

  geolocationSubscription: Subscription;
	geolocationSubscription2: Subscription;
  geolocationOptions: GeolocationOptions = {
    enableHighAccuracy: true,
    timeout: 3000
  };
  currentLocation: IPosition;
  geolocationWatchId: string;
  isLiveProgram: BehaviorSubject<any> = new BehaviorSubject(false);
	interval: any;
	alarmCoords: any = null;
	audio: any =  null;
	public  coordsAsign = new Number(0);
  public  coordsAsignSubject = new Subject<number>();
  public  coordsAsignObservable$ = this.coordsAsignSubject.asObservable();
  constructor( 
    private geolocation: Geolocation,
    private afs: AngularFirestore,
    private storage: Storage,
		private backgroundMode: BackgroundMode
  ) { 
				this.audio = new Audio('../../assets/alarma.mp3');
				this.callGps();
				this.backgroundMode.enable();
        this.backgroundMode.setEnabled(true);
				this.backgroundMode.isActive();
        this.backgroundMode.setDefaults({
          title: "Bus2u",
          text: "Modo background activo, si suena una alarma se ocupa activar el permiso de permitir gps todo el tiempo",
      	});
      this.backgroundMode.disableWebViewOptimizations();
      this.backgroundMode.disableBatteryOptimizations();
      this.backgroundMode.wakeUp();
      let back = this.backgroundMode.on("activate").subscribe((data)=>{
          console.log('VIENDO EL BACK');
					/*setTimeout(() => {
						console.log('setTimeOut')
						this.coordsAsignSubject.next(1);
						
					}, 40000);*/
          //this.backgroundMode.disable
					this.interval = setInterval(() => {
						if (this.alarmCoords !== null) {
							console.log('minutero');
							const select = moment(this.alarmCoords).format('DD-MM-YYYY hh:mm:ss');
							console.log(select);
							// const compare = moment().format("H:mm:ss");
							const compare = moment().format('DD-MM-YYYY hh:mm:ss');
							// const aux =  compare.diff(select, 'minutes');
							console.log(compare)

							const final = moment(compare).diff(moment(select), 'minutes');
							console.log(final)
							if (final >= 1) {
								this.audio.play();
							}
						}
					},10000)
          this.backgroundMode.disableWebViewOptimizations();
          this.backgroundMode.disableBatteryOptimizations();
					this.coordsAsignSubject.next(1);
			})

			let back2 = this.backgroundMode.on("deactivate").subscribe((data)=>{
				console.log('VIENDO EL BACK99999999999999999');
				clearInterval(this.interval)
				this.coordsAsignSubject.next(2);
				this.audio.stop();
				// this.geolocationSubscription2.unsubscribe();
		})
  }

	public coordsObsr(): Observable<any>{
    return this.coordsAsignObservable$
  }

	async callGps() {
		// console.log('entraaaaa11111111111111');
		let contCallsFire = 0;
		this.geolocationSubscription = this.geolocation.watchPosition().pipe(
      filter((position) => (position as Geoposition).coords !== undefined)
      ).subscribe((position: Geoposition) => {
				if (contCallsFire > 15) {
					//console.log('ali'+position.coords.longitude + ' ' + position.coords.latitude);
					this.currentLocation = position;
					this.updateLiveProgram(position);
					contCallsFire = 0;
				}else{
					contCallsFire++;
				}
    },(error) => {
			console.log('error');
			console.log(error)
		})
	}

	async callGps2() {
		return new Promise((resolve, reject)=>{
		// console.log('entraaaaa11111111111111');
			this.geolocation.getCurrentPosition({enableHighAccuracy: true}).then((data) => {
				// console.log('coords')
				// console.log(data)
				
				resolve(data)
			}).catch((error) => {
				console.log('error')
				console.log(error)
			})
		}).catch((error)=>{
		return error;
	})
		/*this.geolocationSubscription2 = this.geolocation.watchPosition().pipe(
      filter((position) => (position as Geoposition).coords !== undefined)
      ).subscribe((position: Geoposition) => {
        console.log('ali8888888888'+position.coords.longitude + ' ' + position.coords.latitude);
        this.currentLocation = position;
        this.updateLiveProgram(position);
    },(error) => {
			console.log('watch error')
		})*/
	}

  setLiveProgram(program: any) {
    // console.log(program);
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
		// console.log('entra aqui???????????');
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const geoPoint = new GeoPoint(latitude, longitude);
    const time = Timestamp.fromDate(new Date());
		/*if (this.alarmCoords === null) {
			this.alarmCoords = position;
		}*/
		this.alarmCoords =  moment().format();
		// if (this.alarmCoords.coords.latitude === )
    this.storage.get('isLiveProgram').then( isLiveProgram => {
			// console.log('entrooo>4423423');
      if(isLiveProgram) {
        this.storage.get('liveProgramDocument').then( path => {
					console.log('veo el path');
					console.log(path)
          if(!!path) {
						// console.log('entra el if????');
            // console.log('path is: ', path);
            this.afs.doc(path).update({
              date: time,
              lastUpdatedAt: time,
              geopoint: geoPoint
            });
          }
        }).catch((error) => {
					console.log(error);
				})
      }
    }).catch((e) => {
			console.log('truena esto')
		})
  }
}
