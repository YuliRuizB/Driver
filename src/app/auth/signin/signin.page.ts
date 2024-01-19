import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AuthService } from '@shared/services/auth.service';
// import { AndroidPermissions }  from '@awesome-cordova-plugins/android-permissions/ngx';
import { AndroidPermissions }  from '@ionic-native/android-permissions/ngx';
import { Platform , AlertController, ModalController} from '@ionic/angular'; 
import { Geolocation, Geoposition, GeolocationOptions, PositionError } from '@awesome-cordova-plugins/geolocation/ngx';
import { AccesDataInfoModalPage } from './../../modals/acces-data-info-modal/acces-data-info-modal.page';
import { OpenNativeSettings } from '@awesome-cordova-plugins/open-native-settings/ngx';
@Component({
  selector: 'app-signin',
  templateUrl: './signin.page.html',
  styleUrls: ['./signin.page.scss'],
})
export class SigninPage implements OnInit {

  loginForm: FormGroup;
  
  constructor( 
    private fb: FormBuilder,
    private authService: AuthService,
		private _AndroidPermissions: AndroidPermissions,
		private _Platform: Platform,
		private _Geolocation: Geolocation,
		private _ModalController: ModalController,
		private _OpenNativeSettings: OpenNativeSettings
    ) { 
    this.loginForm = this.fb.group({
			email: ['', Validators.compose([Validators.required, Validators.email])],
			password: ['', Validators.compose([Validators.required, Validators.minLength(8)])]
		});
  }

  async ngOnInit() {
		console.log('aqui???')
		console.log('ngOnInit')
		// this.bt();
		/*this._AndroidPermissions.requestPermissions([this._AndroidPermissions.PERMISSION.ACCESS_COARSE_LOCATION, this._AndroidPermissions.PERMISSION.ACCESS_FINE_LOCATION, this._AndroidPermissions.PERMISSION.ACCESS_BACKGROUND_LOCATION]).then((data:any) => {
			console.log('request')
			console.log(data)
			/*this._AndroidPermissions.checkPermission(this._AndroidPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then((result) => {
				console.log('esto regresa');
				console.log(result);
				
			}).catch((err) => {
				console.log('en el catch');
				console.log(err);
			});-*/
		/*}).catch((error)=>{
			console.log(error);
		})*/
		/*const accessFineLocationPermission = await this._AndroidPermissions.checkPermission(this._AndroidPermissions.PERMISSION.ACCESS_BACKGROUND_LOCATION);
		console.log('esto veooooo');
		console.log(accessFineLocationPermission)
		const accessFineLocationPermission2 = await this._AndroidPermissions.requestPermissions([this._AndroidPermissions.PERMISSION.ACCESS_FINE_LOCATION, this._AndroidPermissions.PERMISSION.ACCESS_BACKGROUND_LOCATION])
		console.log('heyy');
		console.log(accessFineLocationPermission2)*/

		/*this.current2PositionUserOnly().then(async (data)=>{
			if(data==true){
				this.call();
			}

		})*/

		/*setTimeout(() => {
			this.accesDataInfoModal(1);
		},1500)*/
		
		this.validatePermission();
	}

	async validatePermission() {
		const accessCoarseLocation = await this._AndroidPermissions.checkPermission(this._AndroidPermissions.PERMISSION.ACCESS_COARSE_LOCATION);
		console.log('veo');
		console.log(accessCoarseLocation)
		this.accesDataInfoModal(1);
		// this._OpenNativeSettings.open("application_details");
		/*if (accessCoarseLocation.hasPermission === false) {
			setTimeout(() => {
				this.accesDataInfoModal(1);
			},3000)
		}else{
			// const accessFineLocationPermission = await this._AndroidPermissions.checkPermission(this._AndroidPermissions.PERMISSION.ACCESS_FINE_LOCATION);
			console.log('fine');
			const accessFineLocationPermission2 = await this._AndroidPermissions.checkPermission(this._AndroidPermissions.PERMISSION.ACCESS_COARSE_LOCATION);
			const accessFineLocationPermission3 = await this._AndroidPermissions.checkPermission(this._AndroidPermissions.PERMISSION.ACCESS_FINE_LOCATION);
			console.log(accessFineLocationPermission2)
			console.log(accessFineLocationPermission3)
			this.accesDataInfoModal(2);
			// console.log(accessFineLocationPermission)
		}*/
	}

	async bt() {
		const aux = await this._AndroidPermissions.requestPermission(this._AndroidPermissions.PERMISSION.ACCESS_COARSE_LOCATION);
		console.log('check')
		console.log(aux)

		/*this._AndroidPermissions.requestPermission(this._AndroidPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then((resp) => {
			console.log('check')
		console.log(resp)
		}).catch((err) => {
			console.log('err')
			console.log(err)
		})
		
		// const accessFineLocationPermission4 = await this._AndroidPermissions.checkPermission(this._AndroidPermissions.PERMISSION.ACCESS_LOCATION_EXTRA_COMMANDS);
			/*const accessFineLocationPermission = await this._AndroidPermissions.checkPermission(this._AndroidPermissions.PERMISSION.ACCESS_BACKGROUND_LOCATION);
			const accessFineLocationPermission2 = await this._AndroidPermissions.checkPermission(this._AndroidPermissions.PERMISSION.ACCESS_COARSE_LOCATION);
			const accessFineLocationPermission3 = await this._AndroidPermissions.checkPermission(this._AndroidPermissions.PERMISSION.ACCESS_FINE_LOCATION);
			
			console.log('esto veooooo');
			// console.log(accessFineLocationPermission4);
			console.log(accessFineLocationPermission)
			console.log(accessFineLocationPermission2)

			//este es el bueno
			console.log(accessFineLocationPermission3)
			// this._AndroidPermissions.requestPermission(this._AndroidPermissions.PERMISSION.ACCESS_BACKGROUND_LOCATION)
			*/
	}

  signin() {
    if(this.loginForm.valid) {
      this.authService.signin(this.loginForm.value);
    }
  }

	async callGps() {
		const aux = await this._AndroidPermissions.requestPermission(this._AndroidPermissions.PERMISSION.ACCESS_COARSE_LOCATION);
		console.log('check')
		console.log(aux)
		const accessFineLocationPermission2 = await this._AndroidPermissions.checkPermission(this._AndroidPermissions.PERMISSION.ACCESS_COARSE_LOCATION);
			const accessFineLocationPermission3 = await this._AndroidPermissions.checkPermission(this._AndroidPermissions.PERMISSION.ACCESS_FINE_LOCATION);
			console.log(accessFineLocationPermission2)
			//fine
			console.log(accessFineLocationPermission3)
		if (aux.hasPermission === false) {
			this.accesDataInfoModal(2);
		}else{
			const accessFineLocationPermission3 = await this._AndroidPermissions.checkPermission(this._AndroidPermissions.PERMISSION.ACCESS_FINE_LOCATION);
			if (accessFineLocationPermission3.hasPermission === false) {
				this.accesDataInfoModal(3);
			}
			// this._OpenNativeSettings.open("application_details");
		}
	}

	async accesDataInfoModal(flag: number) {
		console.log('entra');
    const modal = await this._ModalController.create({
      component: AccesDataInfoModalPage,
      componentProps: { value:  flag},
			showBackdrop:true,
			backdropDismiss:false,
    });
		modal.onDidDismiss().then(async (result)=>{
			console.log('veooooo')
			console.log(result)
			if (result.data === 1) {
				// info gps acces
				this.callGps();
			} else
			if (result.data === 2) {
				this.accesDataInfoModal(3);
			}else
			if (result.data === 0){
				const accessFineLocationPermission3 = await this._AndroidPermissions.checkPermission(this._AndroidPermissions.PERMISSION.ACCESS_FINE_LOCATION);
				if (accessFineLocationPermission3.hasPermission === false) {
					this.accesDataInfoModal(3);
				}
			}
		});
    await modal.present();
  }

}
