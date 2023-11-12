import { Component, OnInit, OnDestroy } from '@angular/core';

import { Platform, AlertController } from '@ionic/angular';
// import { SplashScreen } from '@ionic-native/splash-screen/ngx';
// import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ThemeService } from './shared/services/themeservice.service';
import { AuthService } from '@shared/services/auth.service';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';

import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationEvents, BackgroundGeolocationResponse } from '@awesome-cordova-plugins/background-geolocation/ngx';

const config: BackgroundGeolocationConfig = {
  desiredAccuracy: 10,
  stationaryRadius: 20,
  distanceFilter: 30,
  debug: false, //  enable this hear sounds for background-geolocation life-cycle.
  stopOnTerminate: false, // enable this to clear background location settings when the app terminates
};

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  
  user: any;

  public selectedIndex = 0;
  public appPages = [
    {
      title: 'Hoy',
      description: 'Actividades planeadas para el día de hoy',
      url: 'main',
      icon: 'calendar-outline',
      color: 'primary',
      enabled: true
    },
    {
      title: 'Actividades',
      description: 'Programa de trabajo de los siguientes días',
      url: '/main/list',
      icon: 'alarm-outline',
      color: 'primary',
      enabled: true
    },
    {
      title: 'Rutas',
      description: 'Información de las rutas',
      url: '/routes',
      icon: 'git-merge-outline',
      color: 'warning',
      enabled: true
    },
    {
      title: 'Problemas con el autobús',
      description: 'En caso de problemas con el autobús',
      url: '/support/bus',
      icon: 'warning-outline',
      color: 'danger',
      enabled: true
    },
    {
      title: 'Acerca de',
      url: '/about',
      icon: 'build-outline',
      color: 'primary',
      enabled: true
    },
    {
      title: 'Mi información',
      url: '/profile',
      icon: 'person',
      color: 'primary',
      enabled: true
    },
    {
      title: 'Ayuda',
      description: 'Llamada rápida de ayuda',
      action: 'call-outline',
      actionColor: 'success',
      url: '/folder/Trash',
      icon: 'call-outline',
      color: 'primary',
      enabled: false
    }
  ];
  

  constructor(
    private platform: Platform,
    private themeService: ThemeService,
    // private splashScreen: SplashScreen,
    // private statusBar: StatusBar,
    private authService: AuthService,
    private callNumber: CallNumber,
    private alertController: AlertController,
    private backgroundGeolocation: BackgroundGeolocation
  ) {
    this.initializeApp();
  
   this.authService.user_profile.subscribe( (data) => {
      console.log('user_profile subject subscription: ', data);
      this.user = data;
    }); 
  }

  initializeApp() {
    this.platform.ready().then(() => {
      // this.statusBar.styleDefault();
      // this.splashScreen.hide();
      this.backgroundGeolocationConfig();
    });
  }

  backgroundGeolocationConfig() {
    this.backgroundGeolocation.configure(config)
  .then(() => {

    this.backgroundGeolocation.on(BackgroundGeolocationEvents.location).subscribe((location: BackgroundGeolocationResponse) => {
      console.log(location);

      // IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
      // and the background-task may be completed.  You must do this regardless if your operations are successful or not.
      // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
      this.backgroundGeolocation.finish(); // FOR IOS ONLY
    });

  });
  }

  ngOnInit() {
    const path = window.location.pathname.split('folder/')[1];
    if (path !== undefined) {
      this.selectedIndex = this.appPages.findIndex(page => page.title.toLowerCase() === path.toLowerCase());
    }
  }

  signout() {
    this.authService.signout();
  }

  ngOnDestroy() {
    
  }

  makeCall() {
    this.callNumber.callNumber("8112589985", true)
    .then(res => console.log('Launched dialer!', res))
    .catch(err => console.log('Error launching dialer', err));
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: 'Esta llamada será hacia el centro de apoyo técnico de tu empresa.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Llamar',
          handler: () => {
            alert.dismiss().then( () => {
              this.makeCall();
            })
          }
        }
      ]
    });

    await alert.present();
  }
}
