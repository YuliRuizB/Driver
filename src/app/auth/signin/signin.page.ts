import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AuthService } from '@shared/services/auth.service';
import { AndroidPermissions }  from '@awesome-cordova-plugins/android-permissions/ngx';
import { Platform , AlertController} from '@ionic/angular'; 
import { Geolocation, Geoposition, GeolocationOptions, PositionError } from '@awesome-cordova-plugins/geolocation/ngx';
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
		private _Geolocation: Geolocation
    ) { 
    this.loginForm = this.fb.group({
			email: ['', Validators.compose([Validators.required, Validators.email])],
			password: ['', Validators.compose([Validators.required, Validators.minLength(8)])]
		});
  }

  async ngOnInit() {
		console.log('aqui???')
		console.log('ngOnInit')
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

		this.current2PositionUserOnly().then(async (data)=>{
			if(data==true){
				this.call();
			}

		})
	}

	async bt() {
		const accessFineLocationPermission = await this._AndroidPermissions.checkPermission(this._AndroidPermissions.PERMISSION.ACCESS_BACKGROUND_LOCATION);
			const accessFineLocationPermission2 = await this._AndroidPermissions.checkPermission(this._AndroidPermissions.PERMISSION.ACCESS_COARSE_LOCATION);
			const accessFineLocationPermission3 = await this._AndroidPermissions.checkPermission(this._AndroidPermissions.PERMISSION.ACCESS_FINE_LOCATION);
			
			console.log('esto veooooo');
			console.log(accessFineLocationPermission)
			console.log(accessFineLocationPermission2)
			console.log(accessFineLocationPermission3)
			this._AndroidPermissions.requestPermission(this._AndroidPermissions.PERMISSION.ACCESS_BACKGROUND_LOCATION)
	}

  signin() {
    if(this.loginForm.valid) {
      this.authService.signin(this.loginForm.value);
    }
  }

	async current2PositionUserOnly() {
		let accessFineLocationPermission;
		let icoAux
		/*if(this._Platform.is('android')){
			let ico = this.device.version.split(".");
			icoAux = parseInt(ico[0]);
			//alert(icoAux)
			if(icoAux <= 9){
				accessFineLocationPermission = await this.permissions.checkPermission(this.permissions.PERMISSION.ACCESS_FINE_LOCATION)
				console.log(1);
			}else
			if(icoAux==10){
				//this.presentAlert();
				//console.log('2');
				accessFineLocationPermission = await this.permissions.checkPermission(this.permissions.PERMISSION.ACCESS_BACKGROUND_LOCATION)
			}else
			if(icoAux==11){
				accessFineLocationPermission = await this.permissions.checkPermission(this.permissions.PERMISSION.ACCESS_FINE_LOCATION)
			}
	
		}*/
		accessFineLocationPermission = await this._AndroidPermissions.checkPermission(this._AndroidPermissions.PERMISSION.ACCESS_BACKGROUND_LOCATION)
		let accessFineLocationPermission4 = await this._AndroidPermissions.checkPermission(this._AndroidPermissions.PERMISSION.ACCESS_BACKGROUND_LOCATION)
		return new Promise ((resolve,reject)=>{
		if(accessFineLocationPermission && !accessFineLocationPermission.hasPermission) {
			//this.presentAlert();
			//this.presentAlertModal();
			//console.log('bob 0')
			//console.log('viendo el permiso 1');
			//console.log(accessFineLocationPermission)
			if(icoAux==11){
				
				//console.log('bob 1')
				//console.log(accessFineLocationPermission4)
	
				if (accessFineLocationPermission4 && !accessFineLocationPermission4.hasPermission) {
					//console.log('bob 2')
					resolve(true)
				}else{
					//console.log('bob 3')
					resolve(false);
				}
			}else{
			resolve(true);
			}
		}else{
			//resolve(false);
			//console.log('bob 0')
			if(icoAux==11){
				
				//console.log('bob 1')
				//console.log(accessFineLocationPermission4)
	
				if (accessFineLocationPermission4 && !accessFineLocationPermission4.hasPermission) {
					//console.log('bob 2')
					resolve(true)
				}else{
					//console.log('bob 3')
					resolve(false);
				}
			}else{
				//console.log('viendo el permiso 2');
				//console.log(accessFineLocationPermission)
			resolve(false);
			}
		}
		})

		}


		async  permission(){
			const accessFineLocationPermission = await this._AndroidPermissions.checkPermission(this._AndroidPermissions.PERMISSION.ACCESS_BACKGROUND_LOCATION)
			//console.log(accessFineLocationPermission)
			let icoAux
			if (accessFineLocationPermission && !accessFineLocationPermission.hasPermission) {
		 
				//const accessFineLocationPermission2 = await this.permissions.requestPermissions([this.permissions.PERMISSION.ACCESS_FINE_LOCATION, this.permissions.PERMISSION.ACCESS_BACKGROUND_LOCATION])
				//const accessFineLocationPermission3 = await this.permissions.requestPermission(this.permissions.PERMISSION.ACCESS_BACKGROUND_LOCATION)
				let accessFineLocationPermission2;
				console.log('2');
						accessFineLocationPermission2 = await this._AndroidPermissions.requestPermissions([this._AndroidPermissions.PERMISSION.ACCESS_FINE_LOCATION, this._AndroidPermissions.PERMISSION.ACCESS_BACKGROUND_LOCATION])
				//console.log('BACK');
				//console.log(accessFineLocationPermission2)
				return new Promise ((resolve,reject)=>{
				if(accessFineLocationPermission2.hasPermission == false){
					//this.permission();
	
					resolve(false)
				}else{
					//this.callAndroid11();
					//let accessFineLocationPermission3 =  this.permissions.requestPermission(this.permissions.PERMISSION.ACCESS_BACKGROUND_LOCATION)
					//console.log('ANDROID 11');
					//console.log(accessFineLocationPermission3)
					//console.log('icon 11');
					//console.log(icoAux)
					if(icoAux==11){
						resolve(11);
					}else{
						//console.log('cafe')
						resolve(true)
						// this.getCurrentPositionOnly();
					}
				}
			})
		 }else{
			 //resolve(true)
			 return new Promise ((resolve,reject)=>{
				resolve(true)
			})
			 // this.getCurrentPositionOnly();
		 }
		
		
		}

		async callAndroid11(){
			const accessFineLocationPermission = await this._AndroidPermissions.checkPermission(this._AndroidPermissions.PERMISSION.ACCESS_BACKGROUND_LOCATION)
			//console.log(accessFineLocationPermission)
			let icoAux
			if (accessFineLocationPermission && !accessFineLocationPermission.hasPermission) {
				//console.log('validacion de android 11');
				//console.log(accessFineLocationPermission )
				//let accessFineLocationPermission3
				/*this.permissions.requestPermission(this.permissions.PERMISSION.ACCESS_BACKGROUND_LOCATION).then((res)=>{
					console.log('res')
					console.log(res)
					accessFineLocationPermission3 = res;
				})*/
				//this._OpenNativeSettings.open("manage_applications");
				let accessFineLocationPermission3 =  await this._AndroidPermissions.requestPermissions([this._AndroidPermissions.PERMISSION.ACCESS_FINE_LOCATION, this._AndroidPermissions.PERMISSION.ACCESS_BACKGROUND_LOCATION])//await this.permissions.requestPermission(this.permissions.PERMISSION.ACCESS_BACKGROUND_LOCATION)
				//console.log('ANDROID 11');
				//console.log(accessFineLocationPermission3)
				return new Promise ((resolve,reject)=>{
				
				if(accessFineLocationPermission3.hasPermission == false){
					//this.permission();
					resolve(false);
					console.log('alert 2')
				}else{
					resolve(true)
					this.getCurrentPositionOnly();
				}
			
				})
			}
		
		
		}

		call(){
			this.permission().then((data)=>{
	
				if(data==true){
			
					console.log('entro el close');
				}else
				if(data==11){
					this.callAndroid11().then((dataReturn)=>{
						if(dataReturn == true){
							
						}
					});
				}
			});
		}

		getCurrentPositionOnly(){
			this._Geolocation.getCurrentPosition({enableHighAccuracy: true}).then((data) => {
		
				let userPosition = {position: {lat: data.coords.latitude, lng: data.coords.longitude},icon: '', title: '', heading: data.coords.heading };
				console.log(userPosition)
				//console.log('AGUA');
				//console.log(this.positionArrayAux)
			}).catch((error) => {
		 console.log(error);
		});
		}

		public currentPositionUserOnly(): Promise<any>{
    
			return new Promise ((resolve,reject)=>{
				 this._Geolocation.getCurrentPosition({enableHighAccuracy: true}).then((data) => { 
	
							 let userPosition = {position: {lat: data.coords.latitude, lng: data.coords.longitude},icon: '', title: 'alicarlo', heading: data.coords.heading };
							 resolve(userPosition.position);
							
				 }).catch((error) => {
					 console.log(error)
						reject(error);
				 });
	
				});
	
	 }

}
