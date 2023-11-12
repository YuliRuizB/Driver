import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProgramService, Updates } from '@shared/services/program.service';
import { NavController, AlertController } from '@ionic/angular';
import { LivepositionService } from '@shared/services/liveposition.service';

@Component({
  selector: 'app-finish',
  templateUrl: './finish.page.html',
  styleUrls: ['./finish.page.scss'],
})
export class FinishPage implements OnInit, OnDestroy {

  loading: boolean = true;
  programId: any;
  customerId: any;
  program: any = {};
  programSubscription: Subscription;

  checkList = {
    vehicleClean: Boolean(true),
    damages: Boolean(false),
    needsAttention: Boolean(false)
  }

  constructor( private livepositionService: LivepositionService, private route: ActivatedRoute, private router: Router, private programService: ProgramService, private navController: NavController, private alertController: AlertController) {
    this.route.paramMap.subscribe(params => {
      this.programId = params.get('id');
      this.customerId = params.get('customerId');
      this.getSubscriptions();
    });
   }

  ngOnInit() {
  }

  ngOnDestroy() {

  }

  getSubscriptions() {
    this.programSubscription = this.programService.getProgram(this.customerId, this.programId)
    .subscribe((querySnapShot) => {
      this.program = querySnapShot.payload.data();
      this.loading = false;
    })
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      header: 'Confirmación',
      message: '¿Está seguro de finalizar este programa?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Finalizar',
          handler: () => {
            console.log('Confirm Okay');
            this.endProgram();
          }
        }
      ]
    });

    await alert.present();
  }

  endProgram() {
    this.programService.updateProgram(Updates.end, this.customerId, this.programId,'','',this.checkList);
    this.livepositionService.unsetLiveProgram();
    this.navController.navigateBack('main');
  }

}
