import { Component, OnInit,NgZone } from '@angular/core';
import { NavController, NavParams ,ModalController,  AlertController, LoadingController, MenuController,Platform  } from '@ionic/angular';
import { AndroidPermissions }  from '@ionic-native/android-permissions/ngx';
import { OpenNativeSettings } from '@awesome-cordova-plugins/open-native-settings/ngx';
@Component({
  selector: 'app-acces-data-info-modal',
  templateUrl: './acces-data-info-modal.page.html',
  styleUrls: ['./acces-data-info-modal.page.scss'],
})
export class AccesDataInfoModalPage implements OnInit {
	flag: number = 0;
	flagValid: number = 1;
  constructor(private _ModalController: ModalController, private _NavParams: NavParams,private _AndroidPermissions: AndroidPermissions,
		private _AlertController: AlertController, private _OpenNativeSettings: OpenNativeSettings, private _NgZone:NgZone
		) { 
		this.flag = this._NavParams.get('value');
		console.log(this.flag)
	}

  ngOnInit() {
  }

	close(){
		this._ModalController.dismiss(1);
	}

	async permission() {
		const accessCoarseLocation = await this._AndroidPermissions.checkPermission(this._AndroidPermissions.PERMISSION.ACCESS_COARSE_LOCATION);
		console.log('veo22222222');
		console.log(accessCoarseLocation)
		if (accessCoarseLocation.hasPermission === false) {
			const accessCoarseLocation2 = await this._AndroidPermissions.requestPermission(this._AndroidPermissions.PERMISSION.ACCESS_COARSE_LOCATION);
			console.log(accessCoarseLocation2);
			if (accessCoarseLocation2.hasPermission === true) {
				this._ModalController.dismiss(2);
			}else{
				this._NgZone.run(() => {
					this.flagValid = 2;
				})
			}
		}else{
			this._ModalController.dismiss(2);
			
			
		}
	}

	closeApp() {
		this.presentAlert();
	}

	permissionSettingsClose() {
		this._ModalController.dismiss(0);
	}

	permissionSettings() {
		this._OpenNativeSettings.open("application_details");
	}

	async presentAlert() {
    const alert = await this._AlertController.create({
      header: 'Gps - Acceso',
			subHeader: '1- Cerra App: La aplicacion se cerrara por denegar el permiso, 1- Habilitar en Configuracion: La aplicacion lo redireccionara a la configuracion de la app para que acepte los permisos de gps',
      buttons: [
        {
          text: 'Cerrar App',
          role: 'cancel',
          handler: () => {
            navigator['app'].exitApp();
          },
        },
        {
          text: 'Habilitar en Configuracion',
          role: 'confirm',
          handler: () => {
            this._OpenNativeSettings.open("application_details");
          },
        },
      ],
    });

    await alert.present();
  }


}
