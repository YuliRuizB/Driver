import { Component, OnInit, OnDestroy } from '@angular/core';
import { RoutesService } from '@shared/services/routes.service';
import { AuthService } from '@shared/services/auth.service';
import { Subscription, Subject, pipe } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-routes',
  templateUrl: './routes.page.html',
  styleUrls: ['./routes.page.scss'],
})
export class RoutesPage implements OnInit, OnDestroy {

  user: any;
  loading: boolean = true;
  stopSubscription$: Subject<boolean> = new Subject();
  routes: any = [];

  constructor(private routesService: RoutesService, private authService: AuthService) {
    
   }

  ngOnInit() { 
    this.authService.user_profile.subscribe( profile => {
      this.user = profile;
      this.getSubscriptions();
    });
  }

  ngOnDestroy() {
    this.stopSubscription$.next();
    this.stopSubscription$.complete();
  }

  getSubscriptions() {
    this.routesService.getRoutes(this.user.vendorId).pipe(
      takeUntil(this.stopSubscription$),
    ).subscribe( data => {
      const combinedArray = [].concat(...data);
      this.routes = combinedArray;
      console.log(combinedArray);
      this.loading = false;
    }, err => console.log(err))
  }

  showActionSheetWithOptions() {}

}
