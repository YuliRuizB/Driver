import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StorageService } from 'src/app/services/storage/storage.service';
import { PurchasesService } from 'src/app/services/firebase/purchases.service';
import { IUserData } from 'src/app/models/models';
import { take } from 'rxjs/operators';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-usage-details',
  templateUrl: './usage-details.page.html',
  styleUrls: ['./usage-details.page.scss'],
})
export class UsageDetailsPage implements OnInit {

  loading = true;
  activityLog: any = [];
  boardingPassId: any;
  sub: any;
  user: IUserData;

  constructor( private route: ActivatedRoute, private navController: NavController,  private storageService: StorageService, private purchasesService: PurchasesService) { }

  ngOnInit() {


    this.storageService.getItem('userData').then( (userData) => {
      this.user = JSON.parse(userData);
      this.sub = this.route.params.subscribe(params => {
        this.boardingPassId = params['id'];
        console.log(this.boardingPassId);
        this.getSubscriptions();
      });
    })
  }

  setName(type: string) {
    let name = 'Sin información';
    switch (type) {
      case 'beginRoute':
        name = 'Inicio de ruta';
        break;
      case 'endRoute':
        name = 'Fin de ruta';
        break;
      case 'access':
        name = 'Acceso';
        break;
      case 'geo:':
        name = 'Localización';
        break;
      case 'round':
        name = 'Turno incorrecto';
        break;
      case 'route':
        name = 'Ruta incorrecta';
        break;
      case 'duplicate':
        name = 'Uso duplicado';
        break;
      case 'expired':
        name = 'Pase expirado';
        break;
      case 'abuse':
          name = 'Intento de abuso';
          break;
      default:
        name = 'Error';
    }
    return name;
  }

  getSubscriptions() {
    this.purchasesService.getBoardingPassActivityLog(this.user.uid, this.boardingPassId).pipe(take(1)).subscribe( (log) => {
      this.activityLog = log;
      console.log(log);
      this.loading = false;
    })
  }

}
