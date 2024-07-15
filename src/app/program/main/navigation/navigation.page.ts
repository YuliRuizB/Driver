import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MapService } from '@shared/services/map.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgramService, Updates } from '@shared/services/program.service';
import { StopPointsService } from '@shared/services/stop-points.service';
import { Subject, Subscription } from 'rxjs'
import { map, takeUntil, take } from 'rxjs/operators';
import * as _ from 'lodash';
import { OsrmService } from '@shared/services/osrm.service';
import { IonSlides, ActionSheetController, LoadingController, IonSearchbar, ToastController, AlertController } from '@ionic/angular';
import { BoardingPassesService } from '@shared/services/boarding-passes.service';
import { ActivityLogService } from '@shared/services/activity-log.service';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Vibration } from '@awesome-cordova-plugins/vibration/ngx';
import { Console } from 'console';
declare  var google;
@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.page.html',
  styleUrls: ['./navigation.page.scss'],
})
export class NavigationPage implements OnInit, OnDestroy {

  @ViewChild('slides', { static: true }) slides: IonSlides;
  @ViewChild('searchInput', {
    static: false
 }) searchInput: IonSearchbar;
 
  sliderConfig = {
    slidesPerView: 1.5,
    spaceBetween: 1,
    centeredSlides: true
  };
  loading = true;
  loadingCtrl;
  program: any;
  programId: any;
  customerId: any;
  routeId: any;
  flyToZero: any;
  programSubscription: Subscription;
  stopPoints: any = [];
  stopPointsSubscription: Subscription;
  unsubscribeAll: Subject<any> = new Subject();

  scannedText: string = '';
  scanning: boolean = false;
  currentLocation: any;

	public directionsService:      any;
  public polygon:                any= [];
  constructor(
    private mapService: MapService,
    private vibration: Vibration,
    private route: ActivatedRoute,
    private stopPointsService: StopPointsService,
    private programService: ProgramService,
    private boardingPassesService: BoardingPassesService,
    private osrmService: OsrmService,
    public actionSheetController: ActionSheetController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController,
    private activityLogService: ActivityLogService,
    private router: Router
  ) {
    this.programService.pCurrentLocation.pipe(
      takeUntil(this.unsubscribeAll),
    ).subscribe( (position) => {
      this.currentLocation = position;
    });
		this.directionsService = new google.maps.DirectionsService();
   }

  ngOnInit() {
    this.mapService.buildMap();
    setTimeout(() => {
      this.mapService.map.resize();
    }, 1);
    this.route.paramMap.subscribe(params => {
      this.programId = params.get('id');
      this.customerId = params.get('customerId');
      this.routeId = params.get('routeId');
      this.flyToZero = JSON.parse(params.get('flyToZero'));
      this.getSubscriptions();
    });

  }

  ngOnDestroy() {
    this.unsubscribeAll.next();
    this.unsubscribeAll.complete();
    if (this.programSubscription) {
      this.programSubscription.unsubscribe();
    }
    if (this.stopPointsSubscription) {
      this.stopPointsSubscription.unsubscribe();
    }
  }

  getSubscriptions() {
    this.programSubscription = this.programService.getProgram(this.customerId, this.programId)
      .subscribe(program => {
        this.program = program.payload.data();
        this.program.id = program.payload.id;
  
        this.loading = false;
      });

    this.stopPointsSubscription = this.stopPointsService.getRouteStopPoint(this.customerId, this.routeId).pipe(
			take(1),
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id: id, ...data };
      })))
      .subscribe((stopPoints) => {
        if (this.program && this.program.program) {
          this.stopPoints = this.program.program == 'M' ? _.orderBy(stopPoints, 'order', 'asc') : _.orderBy(stopPoints, 'order', 'desc')
        } else {
          this.stopPoints = _.orderBy(stopPoints, 'order', 'asc');
        }
   
        const mapLayer = this.mapService.map.getLayer('route');
        if(typeof mapLayer !== 'undefined') {
          this.flyToSlider(this.slides);
          return;
        }

        this.addRoutePolyline(this.stopPoints);
        setTimeout(() => {
          this.addStopPoints(this.stopPoints);
        }, 500); 
        this.loading = false;
      });
  }

  flyTo(stop) {
    this.mapService.flyTo(this.mapService.map, stop);
  }

  flyToSlider(slides: IonSlides) {
    slides.getActiveIndex().then(activeIndex => {
      this.mapService.flyTo(this.mapService.map, this.stopPoints[activeIndex]);
    })
  }

  addRoutePolyline(polylineObjects: Array<any>) {
    this.createRouteFromStopPoints(polylineObjects);
  }

  addStopPoints(objects: Array<any>) {
    this.createFeatureCollectionFromStopPoints(objects);
  }

  onScanButtonClicked() {
    this.searchInput.setFocus();
    this.scanning = !this.scanning;
  }

  goToScanPage() {
    this.router.navigate(['main','scan', this.programId, this.customerId, this.routeId]);
  }

  onSearchInputDebounced(event) {

    if(!this.scanning) {
      return;
    }

    // this.scannedText = event.detail.value || event.target.value;
    
    if(this.scannedText == null || this.scannedText.length === 0) {
      return;
    }
    this.vibration.vibrate(2000);
    this.validateQRCode(this.scannedText);
  }

  async validateQRCode(code: string) {
    this.scanning = false;
    const isValidQRCode = await this.boardingPassesService.validate(code, this.program);
  
    if(isValidQRCode.success) {
      let color = 'success';
      let message = isValidQRCode.message;
      let title = isValidQRCode.title;
      let duration = 2000;
      if(isValidQRCode.type == 'extension') {
        color = 'warning';
        duration = 4000;
      }
      
      this.presentToast(message, color, duration, title);
      this.recordActivityLog(isValidQRCode)
    } else {
      this.presentActionSheet(isValidQRCode);
    }
  }

  recordActivityLog(event: any) {
    this.activityLogService.recordActivity(event, this.currentLocation, this.program);
  }

  async presentToast(message: string, color?: string, duration?: number, title?: string) {
    const toast = await this.toastController.create({
      header: title || 'Mensaje',
      message,
      duration: duration || 2000,
      position: 'top',
      color: color ? color : 'success'
    });
    toast.present();

    toast.onDidDismiss().then( () => {
      this.setScannerReady();
    })

    //this.presentActionSheet();
  }

  async presentActionSheet(el: any) {
		// console.log('BBBBBBBBBB')
		// console.log(el.type)
    let buttons = [];
    
    if(el.type == 'unknown') {
      buttons = [{
        text: 'Más información',
        icon: 'information-circle-outline',
        handler: () => {
        
          this.presentAlertConfirm(el);
        }
      }, 
			/*{
        // text: 'Permitir subir (Enterado)',
				text: 'Reportar',
        icon: 'log-in-outline',
        handler: () => {
          console.log('Share clicked');
          el.validUsage = false;
          el.updateData = true;
          el.allowedOnBoard = true;
          this.recordActivityLog(el)
        }
      },*/
			{
        text: 'Reintentar',
        icon: 'sync-outline',
        role: 'cancel',
        handler: () => {
      
          this.setScannerReady();
        }
      }];
    } else {
      buttons = [{
        text: 'Más información',
        icon: 'information-circle-outline',
        handler: () => {

          this.presentAlertConfirm(el);
        }
      }, {
        text: 'Negar servicio',
        role: 'destructive',
        icon: 'log-out-outline',
        handler: () => {
 
          el.validUsage = false;
          el.updateData = true;
          el.allowedOnBoard = false;
          this.recordActivityLog(el)
        }
      }, {
        // text: 'Permitir subir (Enterado)',
				text: 'Reportar',
        icon: 'log-in-outline',
        handler: () => {

          el.validUsage = false;
          el.updateData = true;
          el.allowedOnBoard = true;
          this.recordActivityLog(el)
        }
      }, {
        text: 'Reintentar',
        icon: 'sync-outline',
        role: 'cancel',
        handler: () => {

          this.setScannerReady();
        }
      }];
    }

    const actionSheet = await this.actionSheetController.create({
      header: el.title + '. ' + el.message,
      buttons,
    });
    await actionSheet.present();

    actionSheet.onDidDismiss().then( () => {
      this.setScannerReady();
    })
  }

  setScannerReady() {
    
    this.searchInput.getInputElement().then((input: HTMLInputElement) => {
      input.value = null;
    });
      setTimeout(() => { 
        this.searchInput.value = '';
        this.searchInput.setFocus();
        this.scanning = true;
      }, 500);
  }

  async presentAlertConfirm(el:any) {

    let message = formatDistanceToNow(el.timestamp.toDate(), { locale: es, addSuffix: true }) + ' (' + format(el.timestamp.toDate(), 'd MMMM yyyy, hh:mm a', { locale: es}) + ')' + '</br>';
    message += el.message;
    const alert = await this.alertController.create({
      header: el.title,
      message,
      buttons: [
        {
          text: 'Enterado',
          handler: () => {
   
            this.presentActionSheet(el);
          }
        }
      ]
    });

    await alert.present();
  }

  createFeatureCollectionFromStopPoints(stopPoints: any) {
    let features = [];
    stopPoints.forEach((stopPoint: any) => {
      let feature = {
        // feature for Mapbox DC
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [
            stopPoint.geopoint.longitude,
            stopPoint.geopoint.latitude
          ]
        },
        'properties': {
          'title': stopPoint.name,
          'icon': 'pedestrians',
          'icon-halo-blur': 10
        }
      };
      features.push(feature);
    });
    this.mapService.addGeopointsLayer(this.mapService.map, 'stoppoints', features);
  }

  async createRouteFromStopPoints(stopPoints: Array<any>) {

    let coordinates = '';
    let radiuses = '';
    let timestamps = '';
    let count = 0;

    stopPoints.forEach(station => {
      count += 1000;
      coordinates += `${station.geopoint.longitude},${station.geopoint.latitude};`;
      radiuses += '49;'
      timestamps += +((new Date().getTime() / 1000) + (count * 60)).toFixed(0) + ';';
    });

    // this.presentLoading('Cargando ruta');
		this.loadingCtrl = await this.loadingController.create({
      message: 'Cargando ruta',
      spinner: 'dots',
      translucent: true
    });

    await this.loadingCtrl.present();

		let split1: any = coordinates.split(';');
		let coords = [];
		let coords2 = [];

		for(let x = 0; x < split1.length-1; x++) {
			let split2 = split1[x].split(',')
			coords.push([parseFloat(split2[1]),  parseFloat(split2[0])])
		}

		let waypts = [];
		let encodeString = [];
		let encodeString3 = [];
		let dataReturn = [];
		for (let x = 0; x < coords.length; x ++) {
			waypts.push({
				location: {
					lat: coords[x][0],
					lng: coords[x][1],
				}
			})
		}


		await this.directionsService.route({
			origin: new google.maps.LatLng(coords[0][0], coords[0][1]),
			waypoints: waypts,
			destination: new google.maps.LatLng(coords[coords.length-1][0], coords[coords.length-1][1]),
			travelMode: 'DRIVING',
		},async (response, status)=>{

			if (status === "ZERO_RESULTS") {
				this.presentToast('No hay resultados para la ruta', 'danger', 3000, '');
				this.loadingCtrl.dismiss();
				this.mapService.addGEOLine(this.mapService.map, 'route', [], this.flyToZero);
				return;				
			}

			if (status === 'OK') {
				let polylinePath = response.routes[0].overview_polyline;
				let encodePath: string = polylinePath;
				let encodeString2 = google.maps.geometry.encoding.decodePath(encodePath);
				for(var x = 0; x < encodeString2.length; x++) {
					// { markers: { lat: encodeString2[x].lat(), lng: encodeString2[x].lng() }}
					encodeString.push(
						// [ encodeString2[x].lat(), encodeString2[x].lng()]
						// [ encodeString3[x].lng(), encodeString3[x].lat()]
						[ encodeString2[x].lng(), encodeString2[x].lat()]
					);
				}
				// console.log('')
				// console.log(encodeString)
				this.loadingCtrl.dismiss();
				this.mapService.addGEOLine(this.mapService.map, 'route', encodeString, this.flyToZero);

			}

			if (status === 'MAX_WAYPOINTS_EXCEEDED') {
				let check = coords.length;

				let coordsA1;
				let coordsA2;

				let coordsB1;
				let coordsB2;
				if (check > 20) {
		
					coordsA1 = {coords1: coords[0][0], coords2: coords[0][1] };
					coordsA2 = {coords1: coords[20][0], coords2: coords[20][1] };

					coordsB1 = {coords1: coords[21][0], coords2: coords[21][1] };
					coordsB2 = {coords1: coords[coords.length-1][0], coords2: coords[coords.length-1][1] };
				}

				if (check >= 49) {
					this.presentToast('No se puede obtener la ruta, consulte con soporte tecnico', 'danger', 3000, '');
					return
				}

				let way1 = [];
				let way2 = []
				for (let x = 0; x < 21; x ++) {
					way1.push({
						location: {
							lat: coords[x][0],
							lng: coords[x][1],
						}
					})
				}

				for (let x = 20; x < coords.length; x ++) {
					way2.push({
						location: {
							lat: coords[x][0],
							lng: coords[x][1],
						}
					})
				}

				let array1 = [];
				let array2 = [];
				let size = 0;
				for (let x = 0; x < 2; x++) {

					let init = x === 0 ? coordsA1 : coordsB1;
					let fin = x === 0 ? coordsA2 : coordsB2;
					let wayptsAux = x === 0 ? way1 : way2;

					await this.directionsService.route({
						origin: new google.maps.LatLng(init.coords1, init.coords2),
						waypoints: wayptsAux,
						destination: new google.maps.LatLng(fin.coords1, fin.coords2),
						travelMode: 'DRIVING',
					},(response, status)=>{
	
						if (status === "ZERO_RESULTS") {
							this.presentToast('No hay resultados para la ruta', 'danger', 3000, '');
							this.loadingCtrl.dismiss();
							this.mapService.addGEOLine(this.mapService.map, 'route', [], this.flyToZero);
							return;				
						}
			
						if (status === 'OK') {
							array1.push(response.routes[0].overview_polyline)
							/*let polylinePath = response.routes[0].overview_polyline;
							let encodePath: string = polylinePath;
							let encodeString2 = google.maps.geometry.encoding.decodePath(encodePath);
							for(var x = 0; x < encodeString2.length; x++) {
								encodeString.push(
									[ encodeString2[x].lng(), encodeString2[x].lat()]
								);
							}
							this.loadingCtrl.dismiss();
							this.mapService.addGEOLine(this.mapService.map, 'route', encodeString, this.flyToZero);
							*/
						}
					})
				}

				/*console.log('arayys');
				console.log(array1)
				let polylinePath =  array1[0]+"|"+array1[1];// array1[0].concat(array1[1]);;
				console.log(polylinePath)
				*/
				
				let polylinePath =  array1[0]
				let encodePath: string = polylinePath;
				let encodeString2 = google.maps.geometry.encoding.decodePath(encodePath);
				for(var x = 0; x < encodeString2.length; x++) {
					encodeString.push(
						[ encodeString2[x].lng(), encodeString2[x].lat()]
					);
				}


				let polylinePath2 =  array1[1]
				let encodePath2: string = polylinePath2;
				let encodeString32 = [];
				let encodeString22 = google.maps.geometry.encoding.decodePath(encodePath2);
				for(var x = 0; x < encodeString22.length; x++) {
					encodeString32.push(
						[ encodeString22[x].lng(), encodeString22[x].lat()]
					);
				}

				let enc = encodeString.concat(encodeString32)
				this.loadingCtrl.dismiss();
				this.mapService.addGEOLine(this.mapService.map, 'route', enc, this.flyToZero);

			

			}

		})
    /*this.osrmService.getMatchService(
      'driving',
      coordinates.substring(0, coordinates.length - 1),
      radiuses.substring(0, radiuses.length - 1),
      timestamps.substring(0, timestamps.length - 1)).subscribe((response: any) => {

				// this.loadingCtrl.dismiss();
        let polylineArray = [];
        const tracepoints = response.matchings[0].geometry.coordinates;
        _.map(tracepoints, (point) => {
          if (point.length > 0) {
            polylineArray.push([point[0], point[1]]);
          }
        })
				this.loadingCtrl.dismiss();
        setTimeout(() => {
				this.loadingCtrl.dismiss()
				if(!!this.loadingCtrl) {
          this.loadingCtrl.dismiss();
          // this.onScanButtonClicked();  
        }
        }, 4000);
				

				setTimeout(() => {
					this.loadingCtrl.dismiss()
					if(!!this.loadingCtrl) {
						this.loadingCtrl.dismiss();
						// this.onScanButtonClicked();  
					}
					}, 8000);
        this.mapService.addGEOLine(this.mapService.map, 'route', polylineArray, this.flyToZero);
				// this.loadingCtrl.dismiss();
      },(error) => {

				this.loadingCtrl.dismiss();
			})
			*/
  } 

  async showRouteOptions() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Opciones',
      buttons: [{
        text: 'Reportar unidad llena',
        icon: 'body-outline',
        handler: () => {
 
          this.programService.updateProgram(Updates.unitFull, this.program.customerId, this.programId, 'Unidad llena', 'bus_full');
        }
      }, {
        text: 'Reportar problema',
        role: 'destructive',
        icon: 'warning-outline',
        handler: () => {
   
          this.presentProblemReasons(this.program);
        }
      }, {
        text: 'Finalizar ruta',
        icon: 'checkmark-done-outline',
        handler: () => {
  
          this.router.navigate(['main/finish', this.programId, this.program.customerId])
        }
      }, {
        text: 'Cancelar',
        icon: 'close',
        role: 'cancel',
        handler: () => {
       
        }
      }]
    });
    await actionSheet.present();
  }

  async presentProblemReasons(selectedProgram: any) {
    const actionSheet = await this.actionSheetController.create({
      header: '¿Qué problema hay?',
      buttons: [{
        text: 'Unidad descompuesta',
        handler: () => {
  
          this.programService.updateProgram(Updates.problem, selectedProgram.customerId, this.programId, 'Unidad descompuesta', 'bus_danger');
        }
      }, {
        text: 'Llanta(s) ponchada(s)',
        handler: () => {
     
          this.programService.updateProgram(Updates.problem, selectedProgram.customerId, this.programId, 'Llanta(s) ponchada(s)', 'bus_tires');
        }
      }, {
        text: 'Envíen ayuda',
        handler: () => {
 
          this.programService.updateProgram(Updates.problem, selectedProgram.customerId, this.programId, 'Envíen ayuda', 'assistance_needed');
        }
      }, {
        text: 'Cancelar',
        role: 'cancel',
        handler: () => {
  
          this.showRouteOptions();
        }
      }]
    });
    await actionSheet.present();
  }

  async presentLoading(message: string) {
    this.loadingCtrl = await this.loadingController.create({
      message,
      spinner: 'dots',
      translucent: true
    });

    await this.loadingCtrl.present();
  }

}
