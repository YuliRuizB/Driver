import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage, AngularFireUploadTask, AngularFireStorageReference } from '@angular/fire/compat/storage';
import * as firebase from 'firebase/compat/app';
import { ActionSheetController } from '@ionic/angular';
import { IUserData } from 'src/app/models/models';
import { StorageService } from 'src/app/services/storage/storage.service';
import { UsersService } from 'src/app/services/firebase/users.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { AuthService } from '@shared/services/auth.service';

export interface Image {
  id: string;
  image: string;
}

export interface ProfileImage {
  name: string;
  filepath: string;
  size: number;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  profile: FormGroup;
  user: any;
  loading = false;
  currentImage: any;
  userData: IUserData;
  userBucketPath: string = '';
  uploadPercent: Observable<number>;
  uploadvalue: number = 0;
  downloadURL: Observable<string>;

  // Upload Task 
  task: AngularFireUploadTask;
  // Progress in percentage
  percentage: Observable<number>;
  // Snapshot of uploading file
  snapshot: Observable<any>;
  // Uploaded File URL
  UploadedFileURL: Observable<string>;
  //Uploaded Image List
  images: Observable<ProfileImage[]>;

  croppedImagepath = "";
  isLoading = false;

  imagePickerOptions = {
    maximumImagesCount: 1,
    quality: 50
  };

  constructor(private auth: AngularFireAuth,
    private usersService: UsersService,
    private storageService: StorageService,
    public actionSheetController: ActionSheetController,   
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private afs: AngularFirestore,
    private bucketStorage: AngularFireStorage) {
    this.authService.user_profile.subscribe( (user) => {
      if (user) {     
        this.user = user; 
        this.getSubscriptions(this.user.uid);

        this.userBucketPath = `students/pictureIds/${this.user.uid}.jpeg`;
      }
    });
  }

  ngOnInit() {
    this.storageService.getItem('userData').then((userData) => {
      this.userData = JSON.parse(userData);        

    });
    if (this.user) {

    }
  }

  getSubscriptions(uid: string) {
    this.usersService.getUser(uid).pipe(
      map(a => {
        const data = a.payload.data() as any;
        const id = a.payload.id;
        return { id, ...data };
      })
    ).subscribe( (user) => {
      this.userData = user;
    })
  }

  updateData(userDataElement: string, event) {
    
    let newData = event.target.value;
    if (this.userData[userDataElement] != newData) {
      if(userDataElement == 'firstName') {
        this.usersService.updateUserPreference(this.user.uid, {
          [userDataElement]: newData,
          displayName: newData
        });
        this.updateProfile('displayName', event);
      } else {
        this.usersService.updateUserPreference(this.user.uid, {
          [userDataElement]: newData
        });
      }
    }
  }

  updateEmail(event) {
    let user = firebase.default.auth().currentUser;
    if (user.email != event.target.value) {
      user.updateEmail(event.target.value).then(function () {
        // Update successful.
      }).catch(function (error) {
        // An error happened.
      });
    }
  }

  updateProfile(profileElement: string, event) {
    let user = firebase.default.auth().currentUser;
    if (user[profileElement] != event.target.value) {
      user.updateProfile({
        [profileElement]: event.target.value
      }).then(() => {
    
        // this.updateData(profileElement, event);
      }).catch((error) => {
        console.log('update error: ', error);
      });
    }
  }

  pickImage(sourceType) {
  /*   const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: sourceType,
      encodingType: this.camera.EncodingType.JPEG,
    }
    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      console.log('imageData: ', imageData);
      this.loading = true;
      let base64Image = 'data:image/jpeg;base64,' + imageData;
      const fileRef = this.bucketStorage.ref(this.userBucketPath);
      // this.task = this.bucketStorage.upload(this.userBucketPath, base64Image);
      this.task = this.bucketStorage.ref(this.userBucketPath).putString(base64Image, 'data_url');

      // observe percentage changes
      this.uploadPercent = this.task.percentageChanges();
      this.uploadPercent.pipe(
        map(a => {
          return Number((a/100).toFixed(2));
        })
      ).subscribe((value) => {
        this.loading = value != 0;
        this.uploadvalue = value;
      })

      // get notified when the download URL is available
      this.task.snapshotChanges().pipe(
        finalize(() => {
          this.loading = false;
          this.downloadURL = fileRef.getDownloadURL();
          this.downloadURL.subscribe(async (url) => {
            let user = firebase.default.auth().currentUser;
            this.updatePhotoURL(url);
            this.usersService.updateUserPreference(user.uid, { photoURL: url });
          });
        })
      ).subscribe();

    }, (err) => {
      console.log(err);
      this.loading = false;
    }); */
  }

  async updatePhotoURL(url) {
    let user = firebase.default.auth().currentUser;
    console.log("started updatePhotoURL with url: ", url);
    await user.updateProfile({ photoURL: url }).then((response) => {
      this.loading = false;
      return 

    }, err => { 
      this.loading = false;
      return console.log('error, ', err) });
  }

  /* async selectImage() {
    const actionSheet = await this.actionSheetController.create({
      header: "Cambiar imágen desde",
      buttons: [{
        text: 'Galería de imágenes',
        icon: 'images',
        handler: () => {
          this.pickImage(this.camera.PictureSourceType.PHOTOLIBRARY);
        }
      },
      {
        text: 'Cámara',
        icon: 'camera',
        handler: () => {
          this.pickImage(this.camera.PictureSourceType.CAMERA);
        }
      },
      {
        text: 'Cancel',
        role: 'cancel'
      }
      ]
    });
    await actionSheet.present();
  } */

  takePicture() {

   /*  const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      let base64Image = 'data:image/jpeg;base64,' + imageData;
    }, (err) => {
      // Handle error
    }); */

  }

  initializeFormGroup() {
    this.profile = this.formBuilder.group({
      displayName: ['', Validators.compose([Validators.required, Validators.email])],
      photoUrl: ['', Validators.compose([Validators.required, Validators.minLength(8)])]
    })
  }

}
