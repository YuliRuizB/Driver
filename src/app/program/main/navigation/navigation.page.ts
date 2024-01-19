import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MapService } from '@shared/services/map.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgramService, Updates } from '@shared/services/program.service';
import { StopPointsService } from '@shared/services/stop-points.service';
import { Subject, Subscription } from 'rxjs'
import { map, takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';
import { OsrmService } from '@shared/services/osrm.service';
import { IonSlides, ActionSheetController, LoadingController, IonSearchbar, ToastController, AlertController } from '@ionic/angular';
import { BoardingPassesService } from '@shared/services/boarding-passes.service';
import { ActivityLogService } from '@shared/services/activity-log.service';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Vibration } from '@awesome-cordova-plugins/vibration/ngx';

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
        console.log(this.program);
        this.loading = false;
      });

    this.stopPointsSubscription = this.stopPointsService.getRouteStopPoint(this.customerId, this.routeId).pipe(
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
        console.log(this.stopPoints);
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
      console.log(activeIndex);
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
    console.log(event);
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
    console.log(isValidQRCode);
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

    let buttons = [];
    
    if(el.type == 'unknown') {
      buttons = [{
        text: 'Más información',
        icon: 'information-circle-outline',
        handler: () => {
          console.log('Delete clicked');
          this.presentAlertConfirm(el);
        }
      }, {
        text: 'Reintentar',
        icon: 'sync-outline',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
          this.setScannerReady();
        }
      }];
    } else {
      buttons = [{
        text: 'Más información',
        icon: 'information-circle-outline',
        handler: () => {
          console.log('Delete clicked');
          this.presentAlertConfirm(el);
        }
      }, {
        text: 'Negar servicio',
        role: 'destructive',
        icon: 'log-out-outline',
        handler: () => {
          console.log('Delete clicked');
          el.validUsage = false;
          el.updateData = true;
          el.allowedOnBoard = false;
          this.recordActivityLog(el)
        }
      }, {
        text: 'Permitir subir (Enterado)',
        icon: 'log-in-outline',
        handler: () => {
          console.log('Share clicked');
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
          console.log('Cancel clicked');
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
            console.log('Confirm Okay');
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

  createRouteFromStopPoints(stopPoints: Array<any>) {

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
    this.presentLoading('Cargando ruta');
    this.osrmService.getMatchService(
      'driving',
      coordinates.substring(0, coordinates.length - 1),
      radiuses.substring(0, radiuses.length - 1),
      timestamps.substring(0, timestamps.length - 1)).subscribe((response: any) => {
        let polylineArray = [];
        const tracepoints = response.matchings[0].geometry.coordinates;
        _.map(tracepoints, (point) => {
          if (point.length > 0) {
            polylineArray.push([point[0], point[1]]);
          }
        })
        setTimeout(() => {if(!!this.loadingCtrl) {
          this.loadingCtrl.dismiss();
          // this.onScanButtonClicked();  
        }
        }, 2000);
        this.mapService.addGEOLine(this.mapService.map, 'route', polylineArray, this.flyToZero);
      },(error) => {
				console.log('ali');
				console.log(error);
			})
  } 

  async showRouteOptions() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Opciones',
      buttons: [{
        text: 'Reportar unidad llena',
        icon: 'body-outline',
        handler: () => {
          console.log('Delete clicked');
          this.programService.updateProgram(Updates.unitFull, this.program.customerId, this.programId, 'Unidad llena', 'bus_full');
        }
      }, {
        text: 'Reportar problema',
        role: 'destructive',
        icon: 'warning-outline',
        handler: () => {
          console.log('Share clicked');
          this.presentProblemReasons(this.program);
        }
      }, {
        text: 'Finalizar ruta',
        icon: 'checkmark-done-outline',
        handler: () => {
          console.log('Play clicked');
          this.router.navigate(['main/finish', this.programId, this.program.customerId])
        }
      }, {
        text: 'Cancelar',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
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
          console.log('Delete clicked');
          this.programService.updateProgram(Updates.problem, selectedProgram.customerId, this.programId, 'Unidad descompuesta', 'bus_danger');
        }
      }, {
        text: 'Llanta(s) ponchada(s)',
        handler: () => {
          console.log('Share clicked');
          this.programService.updateProgram(Updates.problem, selectedProgram.customerId, this.programId, 'Llanta(s) ponchada(s)', 'bus_tires');
        }
      }, {
        text: 'Envíen ayuda',
        handler: () => {
          console.log('Share clicked');
          this.programService.updateProgram(Updates.problem, selectedProgram.customerId, this.programId, 'Envíen ayuda', 'assistance_needed');
        }
      }, {
        text: 'Cancelar',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
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
