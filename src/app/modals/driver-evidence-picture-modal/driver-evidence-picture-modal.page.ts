import { Component, OnInit, NgZone } from '@angular/core';
import { NavController, NavParams ,ModalController, ToastController , AlertController, LoadingController, MenuController,Platform  } from '@ionic/angular';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import { ShowImageModalPage } from '../show-image-modal/show-image-modal.page';
import { AngularFireStorage, AngularFireUploadTask, AngularFireStorageReference } from '@angular/fire/compat/storage';
import { StorageService } from '../../services/storage/storage.service';
import { AuthService } from '@shared/services/auth.service';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { DriverEvidenceService } from '../../shared/services/driverEvidence/driver-evidence.service';

import { Media, MediaObject } from '@ionic-native/media/ngx';
import { File } from '@ionic-native/file/ngx';
import { Base64 } from '@ionic-native/base64/ngx';
import { AndroidPermissions }  from '@ionic-native/android-permissions/ngx';
import { rejects } from 'assert';


@Component({
  selector: 'app-driver-evidence-picture-modal',
  templateUrl: './driver-evidence-picture-modal.page.html',
  styleUrls: ['./driver-evidence-picture-modal.page.scss'],
})
export class DriverEvidencePictureModalPage implements OnInit {
	data: any = null;
	imageUrl: string = '';
	comentario: string = '';
	userData: any;
	userBucketPath: string = '';
	percentage: Observable<number>;
	task: AngularFireUploadTask
	uploadPercent: Observable<number>;
	downloadURL: Observable<string>;

	userBucketPath2: string = '';
	percentage2: Observable<number>;
	task2: AngularFireUploadTask
	uploadPercent2: Observable<number>;
	downloadURL2: Observable<string>;

	public colorCondition: 	boolean = true;
	public audioFile: 			MediaObject;
  public audioFlag:  			boolean= false;
  public audioFlag2: 			boolean= false;

	public flagPressed: 		boolean=false;
  public pathAudio:   		string;
  public audioBase64: 		any = '';


	public audioPlayer: 		any;
  constructor(
		private _Base64: Base64,
		private _Media: Media,
		private _File: File,
		private _ModalController: ModalController,
		private _NavParams: NavParams,
		private _Camera: Camera,
		private _ToastController: ToastController,
		private _LoadingController:LoadingController,
		private _BucketStorage: AngularFireStorage,
		private _StorageService: StorageService,
		private _AuthService: AuthService,
		private _DriverEvidenceService: DriverEvidenceService,
		private _NgZone : NgZone,
		private _AndroidPermissions: AndroidPermissions
		
	) { 
		this.data = this._NavParams.get('value');
		this._AuthService.user_profile.subscribe( (user) => {
      if (user) {     
        this.userData = user;
				// const compare = moment().format('DD-MM-YYYY-hh:mm:ss');
				// console.log(compare)
        // this.userBucketPath = `students/pictureIds/${this.user.uid}.jpeg`;
      }
    });
	}

  async ngOnInit() {
		this.audioPlayer = <HTMLVideoElement> document.getElementById("audio");
		const accessCamera = await this._AndroidPermissions.checkPermission(this._AndroidPermissions.PERMISSION.READ_MEDIA_AUDIO);
		if (!accessCamera.hasPermission) {
			// this._AndroidPermissions.PERMISSION.READ_EXTERNAL_STORAGE
			const camera = await this._AndroidPermissions.requestPermission(this._AndroidPermissions.PERMISSION.READ_MEDIA_AUDIO);
		}
    // this.colorCondition = this.data.color;
		/*this._StorageService.getItem('userData').then( (userData) => {
      this.userData = JSON.parse(userData);
			console.log('user data')
			console.log(this.userData)
    })*/
	}

	close() {
		this._ModalController.dismiss();
	}

	deleteImage() {
		this.imageUrl = '';
	}

	async openImageModal() {
		const modal = await this._ModalController.create({
      component: ShowImageModalPage,
      componentProps: { value: this.imageUrl },
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

	pickImage() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this._Camera.DestinationType.DATA_URL,
      sourceType: this._Camera.PictureSourceType.CAMERA,
      encodingType: this._Camera.EncodingType.JPEG,
    }
    this._Camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
			this.imageUrl = 'data:image/png;base64,' + imageData;

    }, (err) => {
      console.log(err);
    });
  }

	async presentToast(message: string, duration?: number, color?: string) {
    const toast = await this._ToastController.create({
      message,
      duration: duration || 3000,
      color: color || 'danger',
      position: 'bottom'
    });
    toast.present();

  }

	async save() {
		if (this.imageUrl === '') {
			this.presentToast('Agregue una fotografia',3000, 'danger')
			return;
		}

		if (this.comentario === '') {
			this.presentToast('Ingrese un comentario',3000, 'danger')
			return;
		}

		const loading = await this._LoadingController.create({
			message: 'Subiendo registro...',
		});
		await loading.present();
		const dateTimeId = moment().format('DD-MM-YYYY-hh:mm:ss');
		const dateTime = moment().format('DD-MM-YYYY hh:mm:ss');
		const date = moment().format('DD-MM-YYYY');

		let sendData = { 
			idDoc: '',
			uid: this.userData.uid,
			displayName: this.userData.displayName,
			userName: this.userData.username,
			lastName: this.userData.lastName,
			email: this.userData.email,
			employeeId: this.userData.employeeId,
			customerId: this.data.customerId,
			programId: this.data.programId,
			routeId: this.data.routeId,
			dateTimeId: dateTimeId,
			dateTime: dateTime,
			date: date,
			dateFormat: moment().format(),
			comentario: this.comentario
		}

		const urlImage = await this.uploadImage(dateTimeId);
		if (urlImage === false) {
			loading.dismiss();
			return
		}

		const urlAudio = await this.uploadAudio(dateTimeId);
		if (urlImage === false) {
			loading.dismiss();
			return
		}

		const response1 =  await this._DriverEvidenceService.insertDriverEvidenceInside(sendData, urlImage, urlAudio);

		if (response1 === false) {
			loading.dismiss();
			this.presentToast('Problemas al subir el registro:3',3000, 'danger')
			return;
		}

		const response2 = await this._DriverEvidenceService.insertDriverEvidenceRoot(sendData, urlImage, urlAudio);
		if (response2 === false) {
			loading.dismiss();
			this.presentToast('Problemas al subir el registro:4',3000, 'danger')
			return;
		}
		loading.dismiss();
		this.presentToast('Registro exitoso',3000, 'success');
		this._ModalController.dismiss();
		

		// new Date(date)
		/*
		this.userBucketPath = `driversEvidence/pictureIds/${this.userData.uid}-${dateTimeId}.jpeg`;
		const fileRef = this._BucketStorage.ref(this.userBucketPath);
    this.task = this._BucketStorage.ref(this.userBucketPath).putString(this.imageUrl, 'data_url');

      // observe percentage changes
      this.uploadPercent = this.task.percentageChanges();

			this.task.snapshotChanges().pipe(
        finalize(() => {

          this.downloadURL = fileRef.getDownloadURL();
          this.downloadURL.subscribe(async (url) => {
						console.log('inside url')
						console.log(url)
						const response1 =  await this._DriverEvidenceService.insertDriverEvidenceInside(sendData, url);

						if (response1 === false) {
							loading.dismiss();
							this.presentToast('Problemas al subir el registro:3',3000, 'danger')
							return;
						}

						const response2 = await this._DriverEvidenceService.insertDriverEvidenceRoot(sendData, url);
						if (response2 === false) {
							loading.dismiss();
							this.presentToast('Problemas al subir el registro:4',3000, 'danger')
							return;
						}
						loading.dismiss();
						this.presentToast('Registro exitoso',3000, 'success');
						this._ModalController.dismiss();

          },(e) => {
						loading.dismiss();
						this.presentToast('Problemas al subir el registro:2',3000, 'danger')
					})
        })
      ).subscribe(() => {

			},(error) => {
				loading.dismiss();
				this.presentToast('Problemas al subir el registro:1',3000, 'danger')
			})*/
	}


	uploadImage(dateTimeId) {
		return new Promise((resolve, rejects) => {
		if (this.imageUrl === '') {
			resolve(true);
		}
		this.userBucketPath = `driversEvidence/pictureIds/${this.userData.uid}-${dateTimeId}.jpeg`;
		const fileRef = this._BucketStorage.ref(this.userBucketPath);
    this.task = this._BucketStorage.ref(this.userBucketPath).putString(this.imageUrl, 'data_url');

      // observe percentage changes
      this.uploadPercent = this.task.percentageChanges();

			this.task.snapshotChanges().pipe(
        finalize(() => {

          this.downloadURL = fileRef.getDownloadURL();
          this.downloadURL.subscribe(async (url) => {
						// const response1 =  await this._DriverEvidenceService.insertDriverEvidenceInside(sendData, url);
						resolve(url);
          },(e) => {
						resolve(false)
						this.presentToast(`Problemas al subir la imagen:2 - ${e}`,3000, 'danger')
					})
        })
      ).subscribe(() => {

			},(error) => {
				// loading.dismiss();
				resolve(false)
				this.presentToast('Problemas al subir la imagen:1',3000, 'danger')
			})
		})
	}

	uploadAudio(dateTimeId) {
		return new Promise((resolve, rejects) => {
		if (this.audioBase64 === '') {
			resolve(true);
		}
		this.userBucketPath2 = `driversEvidence/audioIds/${this.userData.uid}-${dateTimeId}.mp3`;
		const fileRef = this._BucketStorage.ref(this.userBucketPath2);
    this.task2 = this._BucketStorage.ref(this.userBucketPath2).putString(this.audioBase64, 'data_url');

      // observe percentage changes
      this.uploadPercent2 = this.task2.percentageChanges();

			this.task2.snapshotChanges().pipe(
        finalize(() => {

          this.downloadURL2 = fileRef.getDownloadURL();
          this.downloadURL2.subscribe(async (url) => {
						// const response1 =  await this._DriverEvidenceService.insertDriverEvidenceInside(sendData, url);
						resolve(url);
          },(e) => {
						resolve(false)
						this.presentToast(`Problemas al subir la imagen:22 - ${e}`,3000, 'danger')
					})
        })
      ).subscribe(() => {

			},(error) => {
				// loading.dismiss();
				resolve(false)
				this.presentToast('Problemas al subir la imagen:11',3000, 'danger')
			})
		})
	}


	public audio(flag){

  	if(flag == true){
    	this.audioFlag=true
			this.colorCondition = false;

    	this.startAudio()
  	}else{
    	this.audioFlag=false;
			this.colorCondition = true;
    	this.stopAudio();
  	}
	}

  public startAudio(): void {
	
		this.audioBase64 = '';
		// const currentDate =  new Date().toLocaleString().replace(/[,:\s\/]/g, '-');
		// const fileName = `myFile-${currentDate}-${Math.random().toString(36).substr(2, 20)}.png`;
		
		this.audioFile = this._Media.create(this._File.externalDataDirectory.replace(/file:\/\//g, '') +'alicarlo2.mp3')

    this.pathAudio = this._File.externalDataDirectory.replace(/file:\/\//g, '') +'alicarlo2.mp3'
    /*this.audioFile = this._Media.create(this._File.externalDataDirectory.replace(/file:\/\//g, '') +'alicarlo2.mp3')

    this.pathAudio = this._File.externalDataDirectory.replace(/file:\/\//g, '') +'alicarlo2.mp3'
		console.log(this.pathAudio)*/
    // this.audioFile.onStatusUpdate.subscribe(status => console.log('BUYAA'+status)); // fires when file status changes
    // this.audioFile.onSuccess.subscribe(() => console.log('Action is successful'));
    
		this.audioFile.onStatusUpdate.subscribe((res) => {
	
		})

		this.audioFile.onSuccess.subscribe((res) => {

		})
		
		this.audioFile.onError.subscribe((error)=>{
		
    })
    this.audioFile.startRecord()
  }

	public stopAudio(): void {
    this.flagPressed=false

    this.audioFile.stopRecord();
    this.audioFile.release();
		this._File.checkFile('/storage/emulated/0/', 'alicarlo.mp3').then(
			res => {
				console.log('file exist', res);
			},
			err => {
				console.log('file doesnt exist',err);
			}
		);

    this._Base64.encodeFile(this.pathAudio).then((returnAudio)=>{
      this._NgZone.run(()=>{
      	let auxAudio = returnAudio.split('base64')
      	let dataAux2 = "data:audio/mp3;base64"+auxAudio[1];
      	this.audioBase64=dataAux2;

      })
    }).catch((error)=>{
      console.log(error)
    })
  }

	deleteAudio() {
		this.audioBase64 = '';
	}

}
