import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ModalController, ToastController, LoadingController, ActionSheetController, AlertController } from '@ionic/angular';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner/ngx';
import { ActivatedRoute, Router } from '@angular/router';
import { AuditLogService } from '@shared/services/audit-log.service';
import { BoardingPassesService } from '@shared/services/boarding-passes.service';
import { ProgramService } from '@shared/services/program.service';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { ActivityLogService } from '@shared/services/activity-log.service';
import * as _ from 'lodash';
import { Vibration } from '@awesome-cordova-plugins/vibration/ngx';
import { DriverEvidencePictureModalPage } from '../../../modals/driver-evidence-picture-modal/driver-evidence-picture-modal.page';

@Component({
  selector: 'app-scan',
  templateUrl: './scan.page.html',
  styleUrls: ['./scan.page.scss'],
})
export class ScanPage implements OnInit, OnDestroy {

  loading: boolean = true;
  unsubscribeLoadingIndicator$: Subject<boolean> = new Subject();
  loadingEl: HTMLIonLoadingElement;

  scanResult: any;
  scanning: boolean = false;
  light: boolean = false;
  camera: boolean = false; // false=defaultCamera (scenario), true=frontCamera

  programId: any;
  customerId: any;
  routeId: any;

  programSubscription: Subscription;
  program: any = {};
  boardingPasses: any = [];
  boardingPassesSubscription: Subscription;
  auditLog: any = [];
  auditLogSubscription: Subscription;

  currentLocation: any;
  scannedText: string;

  allowedOnBoard: number = 0;
	openScan: boolean = false;
  constructor(public toastController: ToastController,
    public loadingController: LoadingController,
    public actionSheetController: ActionSheetController,
    private qrScanner: QRScanner,
    private route: ActivatedRoute,
    private auditLogService: AuditLogService,
    private boardingPassesService: BoardingPassesService,
    private programService: ProgramService,
    private alertController: AlertController,
    private activityLogService: ActivityLogService,
    private router: Router,
    private vibration: Vibration,
		private _ModalController: ModalController
  ) {
    this.route.paramMap.subscribe(params => {
      this.programId = params.get('id');
      this.customerId = params.get('customerId');
      this.routeId = params.get('routeId');
      this.getSubscriptions();


      this.programService.pCurrentLocation.subscribe( (position) => {

        this.currentLocation = position;
      });
    });
  }

  async showQRToast(message) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom'
    });
    toast.present();
  }

	async openModal() {
		const send = { programId: this.programId, customerId: this.customerId, routeId: this.routeId }
		const modal = await this._ModalController.create({
      component: DriverEvidencePictureModalPage,
      componentProps: { value: send },
			showBackdrop:true,
			backdropDismiss:false,
    });
		modal.onDidDismiss().then((result)=>{
			if (result.data === 1) {
				// this._NavController.navigateForward('check-request-pre-register');
			} else {
		
			}
		});
    await modal.present();
	}

  ngOnInit() {
    // this.scanQRCode();
  }

  ngOnDestroy() {

    this.unsubscribeLoadingIndicator$.next(true);
    this.unsubscribeLoadingIndicator$.complete();
    this.closeScanner(true);
    if(this.boardingPassesSubscription) {
      this.boardingPassesSubscription.unsubscribe();
    }
    if(this.auditLogSubscription) {
      this.auditLogSubscription.unsubscribe();
    }
    if(this.programSubscription) {
      this.programSubscription.unsubscribe();
    }
  }

  getSubscriptions() {
    this.auditLogSubscription = this.auditLogService.getAuditLog(this.programId).pipe(
      map(actions => actions.map(a => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data() as any;
        return { id:id, ...data }
      })))
    .subscribe( (logs) => {
      this.auditLog = logs;
      this.allowedOnBoard = _.filter(logs, (l) => { return l.allowedOnBoard }).length;
 
      this.loading = false;

    });

    this.programSubscription = this.programService.getProgram(this.customerId, this.programId)
    .subscribe(program => {
      this.program = program.payload.data();
      this.program.id = program.payload.id;

    });
  }

  scanQRCode() {
    
    const rootElement = <HTMLElement>document.getElementsByTagName('html')[0];
    rootElement.classList.add('qr-scanner-open');
		this.openScan = true;
    this.qrScanner.prepare().then((status: QRScannerStatus) => {
      if (status.authorized) {
        this.qrScanner.show();
        this.scanning = true;
        // window.document.querySelector('.app-root').classList.add('transparentBody');
        let scanSub = this.qrScanner.scan().subscribe((text: string) => {
          this.vibration.vibrate(2000);
          this.scannedText = text;
					scanSub.unsubscribe();
          this.validateQRCode(text);
           // stop scanning
          // this.closeScanner(true);
          // this.scanning = false;

        });
      } else if (status.denied) {
        console.log('denied: ', status.denied)
      } else {
        console.log('permission temporarily denied');
      }
    }).catch((e: any) => {
      console.log('Error is', e);
    });
  }

  toggleCamera() {
    this.camera = !this.camera;
    const selectedCamera = this.camera ? 1:0;
    this.qrScanner.useCamera(selectedCamera);
  }

  toggleLight() {
    this.light = !this.light;
    if(this.light) {
      this.qrScanner.enableLight();
    } else {
      this.qrScanner.disableLight();
    }
  }

  closeScanner(value: boolean) {
    const rootElement = <HTMLElement>document.getElementsByTagName('html')[0];
    rootElement.classList.remove('qr-scanner-open');
    this.scanning = false;
    let app_root = window.document.querySelector('.app-root');
    if (app_root) {
      app_root.classList.remove('transparentBody');
    }
    this.qrScanner.hide();
    this.qrScanner.destroy();
		this.openScan = false;
  }

  goEventDetails(programId: string) {
    this.closeScanner(true);
    this.router.navigate(['main/event-details', programId]);
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
      // this.scanQRCode();
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
      
          this.presentAlertConfirm(el);
        }
      }, 
			{
        // text: 'Permitir subir (Enterado)',
				text: 'Reportar',
        icon: 'log-in-outline',
        handler: () => {
  
          el.validUsage = false;
          el.updateData = true;
          el.allowedOnBoard = true;
          this.recordActivityLog(el)
        }
      },
			
			{
        text: 'Reintentar',
        icon: 'sync-outline',
        role: 'cancel',
        handler: () => {
      
        }
      }];
    } else {
      buttons = [{
        text: 'Más información',
        icon: 'information-circle-outline',
        handler: () => {
  
          this.presentAlertConfirm(el);
        }
      },
			{
        // text: 'Permitir subir (Enterado)',
				text: 'Reportar',
        icon: 'log-in-outline',
        handler: () => {
    
          el.validUsage = false;
          el.updateData = true;
          el.allowedOnBoard = true;
          this.recordActivityLog(el)
        }
      },
			{
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
      
        }
      }];
    }

    const actionSheet = await this.actionSheetController.create({
      header: el.title + '. ' + el.message,
      buttons,
    });
    await actionSheet.present();

    actionSheet.onDidDismiss().then( () => {
      this.scanQRCode();
    })
  }


  async validateQRCode(code: string) {

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
			setTimeout(() => {
				this.scanQRCode();
			},2000)
			
			// this.closeScanner(true);
      this.presentToast(message, color, duration, title);
      this.recordActivityLog(isValidQRCode)
    } else {
      this.presentActionSheet(isValidQRCode);
    }
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

  recordActivityLog(event: any) {
    this.activityLogService.recordActivity(event, this.currentLocation, this.program);
  }
}
