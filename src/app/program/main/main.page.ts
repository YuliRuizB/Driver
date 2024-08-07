import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ProgramService, Updates } from '@shared/services/program.service';
import { Subscription } from 'rxjs';
import { map,take } from 'rxjs/operators';
import { AuthService } from '@shared/services/auth.service';
import { ActionSheetController, IonItemSliding } from '@ionic/angular';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { LivepositionService } from '@shared/services/liveposition.service';
import { Storage } from '@ionic/storage-angular';
import { differenceInMinutes } from 'date-fns';
// import { AndroidPermissions }  from '@awesome-cordova-plugins/android-permissions/ngx';
import { AndroidPermissions }  from '@ionic-native/android-permissions/ngx';
@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit, OnDestroy {

  user;
  loading: boolean = true;
  program: any = [];
  featuredProgram: any = [];
  finishedProgram: any = [];
  optionSelected: string = "1";
  programSubscription: Subscription;
  isLiveProgram;
	interval: any;
  @ViewChild('slide', { static: true }) slide: IonItemSliding;

  constructor(private programService: ProgramService, private storage: Storage, private livepositionService: LivepositionService, private router: Router, public actionSheetController: ActionSheetController, private authService: AuthService,
		private _AndroidPermissions: AndroidPermissions
		) {

  }

  ngOnInit() {
		this._AndroidPermissions.checkPermission(this._AndroidPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then((result) => {
      
			/*this._AndroidPermissions.requestPermission(this._AndroidPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then((data:any) => {

			}).catch((error)=>{
				console.log(error);
			})*/
    }).catch((err) => {

      console.log(err);
    });
    this.authService.user_profile.subscribe((data) => {
      this.user = data;

      if (!!this.user) {
        this.getSubscriptions();
      }
    });


		this.livepositionService.coordsObsr().subscribe((subs) => {

			if (subs === 1 ) {
					
			}else{
				clearInterval(this.interval)
			}
		});
    this.livepositionService.isLiveProgram.subscribe( (isLiveProgram: boolean) => {
      this.isLiveProgram = isLiveProgram;
    })


		/*this.interval =  setInterval(() => {
			this.livepositionService.callGps2().then((resp) => {

			});
		},5000);*/
  }

  ngOnDestroy() {
    if (this.programSubscription) {
      this.programSubscription.unsubscribe();
    }
  }

  getSubscriptions() {
	
    this.programSubscription = this.programService.getTodayActivePrograms(this.user.uid).pipe(
			// take(1),
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        const docPath = a.payload.doc.ref.parent.path;
        return { id: id, path: docPath, ...data };
      })))
      .subscribe((program: any) => {

        this.organizeProgram(program);
      });
  }

  organizeProgram(unorderedProgram: any) {
    
    this.featuredProgram = [];
    let orderedProgram = _.sortBy(unorderedProgram, [ function(p) {
      let startDate = p.startAt.toDate();

      
      return startDate;
    }])
    const activeProgram = _.filter([...orderedProgram], (p) => {
      return !p.hasEnded && !p.isRejected;
    })
    this.finishedProgram = [];
    this.finishedProgram = _.filter([...orderedProgram], (p) => {
      return !!p.hasEnded;
    });
 

    if(activeProgram.length > 0) {
      this.featuredProgram.push(activeProgram[0]);
			// this.featuredProgram = activeProgram
      this.program = [];
      this.program = [...activeProgram];
      this.program.shift();
    }
    this.loading = false;
  }

  async showActionSheetWithOptions(selectedProgram: any, slide?: IonItemSliding) {
    let buttons = [];

    if (!!selectedProgram.isLive) {
      buttons = [{
        text: 'Continuar programa',
        icon: 'map-outline',
        handler: () => {
          if(slide) {
            slide.close();
          }
          this.livepositionService.setLiveProgram(selectedProgram);
          this.router.navigateByUrl(`main/navigation/${selectedProgram.id}/${selectedProgram.customerId}/${selectedProgram.routeId}/false`);
        }
      }, {
        text: 'Escanear pases',
        icon: 'qr-code-outline',
        handler: () => {
          if(slide) {
            slide.close();
          }
          this.router.navigateByUrl(`main/scan/${selectedProgram.id}/${selectedProgram.customerId}/${selectedProgram.routeId}`);
        }
      }, {
        text: 'Terminar',
        icon: 'stop',
        handler: () => {
     
          if(slide) {
            slide.close();
          }
          this.router.navigateByUrl(`main/finish/${selectedProgram.id}/${selectedProgram.customerId}`);
        }
      }, {
        text: 'Cancelar',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          if(slide) {
            slide.close();
          }
      
        }
      }]
    } else if(!!selectedProgram.hasEnded) {
      buttons = [{
        text: 'Ver información detallada',
        icon: 'search-outline',
        handler: () => {
  
          if(slide) {
            slide.close();
          }
          this.router.navigateByUrl(`main/finish/${selectedProgram.id}/${selectedProgram.customerId}`);
        }
      }, {
        text: 'Cancelar',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          if(slide) {
            slide.close();
          }
      
        }
      }]
    } else {

      buttons.push({
        text: 'Rechazar programa',
        icon: 'thumbs-down-outline',
        role: 'destructive',
        handler: () => {
     
         
          this.presentRejectedReasons(selectedProgram, slide); 
          this.optionSelected = "Rechazar programa";
   
        }
      });

      if (!selectedProgram.isConfirmed) {
        buttons.push({
          text: 'Confirmarlo',
          icon: 'thumbs-up-outline',
          handler: () => {

            if(slide) {
              slide.close();
            }
            this.programService.updateProgram(Updates.confirm, selectedProgram.customerId, selectedProgram.id);
          }
        });
      }

      if (!selectedProgram.isWithTrouble) {
        buttons.push({
          text: 'Problema',
          icon: 'warning-outline',
          role: 'destructive',
          handler: () => {
 
            this.presentProblemReasons(selectedProgram, slide);
          }
        });
      }

      if (!!selectedProgram.isWithTrouble) {
        buttons.push({
          text: 'Problema resuelto',
          icon: 'checkmark-done-outline',
          handler: () => {
  
            if(slide) {
              slide.close();
            }
            this.programService.updateProgram(Updates.okNow, selectedProgram.customerId, selectedProgram.id);
          }
        });
      }

      if (!selectedProgram.isWithTrouble || !!selectedProgram.isConfirmed) {

        const selectedProgramStartsAt = selectedProgram.startAt.toDate();
        const actualDate = new Date();
        const timeDiff = Math.abs(differenceInMinutes(actualDate, selectedProgramStartsAt));
        // console.log(timeDiff);
        
         // if(!this.isLiveProgram && timeDiff <= 60) {

            buttons.push({
              text: 'Iniciar la ruta',
              icon: 'play',
              handler: () => {
       
                if(slide) {
                  slide.close();
                }
								

                this.programService.updateProgram(Updates.setLive, selectedProgram.customerId, selectedProgram.id);
                this.livepositionService.setLiveProgram(selectedProgram);
                this.router.navigateByUrl(`main/navigation/${selectedProgram.id}/${selectedProgram.customerId}/${selectedProgram.routeId}/true`);
              }
            });
         // };
      }
      buttons.push({
        text: 'Cancelar',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          if(slide) {
            slide.close();
          }

        }
      });
    }
    const actionSheet = await this.actionSheetController.create({
      header: 'Acciones...' + this.optionSelected,
      buttons: buttons
    });
    await actionSheet.present();

  }

  async presentRejectedReasons(selectedProgram: any, slide?: IonItemSliding) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Motivo del rechazo',
      buttons: [{
        text: 'Unidad descompuesta',
        handler: () => {
 
          if(slide) {
            slide.close();
          }
          this.optionSelected = this.optionSelected + " unidad descompuesta  programa";
         // this.programService.updateProgram(Updates.reject, selectedProgram.customerId, selectedProgram.id, 'Unidad descompuesta', 'bus_danger');
          this.optionSelected = this.optionSelected + " 333";
        }
      }, {
        text: 'Llanta(s) ponchada(s)',
        handler: () => {
 
          if(slide) {
            slide.close();
          }
          this.programService.updateProgram(Updates.reject, selectedProgram.customerId, selectedProgram.id, 'Llanta(s) ponchada(s)', 'bus_tires');
        }
      }, {
        text: 'Estoy enfermo',
        handler: () => {
   
          if(slide) {
            slide.close();
          }
          this.programService.updateProgram(Updates.reject, selectedProgram.customerId, selectedProgram.id, 'Estoy enfermo', 'driver_sickness');
        }
      }, {
        text: 'Imprevisto personal',
        handler: () => {
     
          if(slide) {
            slide.close();
          }
          this.programService.updateProgram(Updates.reject, selectedProgram.customerId, selectedProgram.id, 'Imprevisto personal', 'driver_unavailable');
        }
      }, {
        text: 'Cancelar',
        role: 'cancel',
        handler: () => {
       
          this.showActionSheetWithOptions(selectedProgram, slide);
        }
      }]
    });
    await actionSheet.present();
  }

  async presentProblemReasons(selectedProgram: any, slide?: IonItemSliding) {
    const actionSheet = await this.actionSheetController.create({
      header: '¿Qué problema hay?',
      buttons: [{
        text: 'Unidad descompuesta',
        handler: () => {
       
          if(slide) {
            slide.close();
          }
          this.programService.updateProgram(Updates.problem, selectedProgram.customerId, selectedProgram.id, 'Unidad descompuesta', 'bus_danger');
        }
      }, {
        text: 'Llanta(s) ponchada(s)',
        handler: () => {
      
          if(slide) {
            slide.close();
          }
          this.programService.updateProgram(Updates.problem, selectedProgram.customerId, selectedProgram.id, 'Llanta(s) ponchada(s)', 'bus_tires');
        }
      }, {
        text: 'Envíen ayuda',
        handler: () => {
   
          if(slide) {
            slide.close();
          }
          this.programService.updateProgram(Updates.problem, selectedProgram.customerId, selectedProgram.id, 'Envíen ayuda', 'assistance_needed');
        }
      }, {
        text: 'Cancelar',
        role: 'cancel',
        handler: () => {
   
          this.showActionSheetWithOptions(selectedProgram, slide);
        }
      }]
    });
    await actionSheet.present();
  }


}
