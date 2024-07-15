import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
// import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/ngx';
// import { StatusBar } from '@ionic-native/status-bar/ngx';


import { AppRoutingModule } from './app-routing.module';

import { IonicStorageModule } from '@ionic/storage-angular'

// Firebase
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFireMessagingModule } from '@angular/fire/compat/messaging';
import { AngularFireAuthGuard } from '@angular/fire/compat/auth-guard';

import { environment } from 'src/environments/environment';

//QR Scanner
import { QRScanner } from '@ionic-native/qr-scanner/ngx';
import { FormsModule } from '@angular/forms';
import { MenuPage } from '@shared/components/menu/menu.page';
import { HttpClientModule } from '@angular/common/http';

//Geolocation
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
// import { BackgroundGeolocation } from '@awesome-cordova-plugins/background-geolocation/ngx';

// i18n
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es-MX';
import localeMXExtra from '@angular/common/locales/extra/es-MX';

registerLocaleData(localeEs, 'es-MX', localeMXExtra);

//Call Number
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
import { Vibration } from '@awesome-cordova-plugins/vibration/ngx';
import { AppComponent } from './app.component';
import { BackgroundMode } from '@ionic-native/background-mode/ngx'
// import { AndroidPermissions }  from '@awesome-cordova-plugins/android-permissions/ngx';
import { AndroidPermissions }  from '@ionic-native/android-permissions/ngx';
import { OpenNativeSettings } from '@awesome-cordova-plugins/open-native-settings/ngx';
import { Media, MediaObject } from '@ionic-native/media/ngx';
import { File } from '@ionic-native/file/ngx';
import { Base64 } from '@ionic-native/base64/ngx';

@NgModule({
  declarations: [AppComponent, MenuPage],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    AngularFireStorageModule,
    AngularFireMessagingModule,
    AngularFirestoreModule,
    IonicStorageModule.forRoot({
      name: '__mydb'
    })
  ],
  providers: [
    // StatusBar,
    // SplashScreen,
		Camera,
    Geolocation,
    CallNumber,
    Vibration,
		Media,
		File,
		Base64,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: LOCALE_ID, useValue: 'es-MX' },
    AngularFireAuthGuard,
    // BackgroundGeolocation,
		BackgroundMode,
		AndroidPermissions,
    QRScanner,
		OpenNativeSettings
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
