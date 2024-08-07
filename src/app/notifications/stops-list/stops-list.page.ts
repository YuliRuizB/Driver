import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, NavParams, IonSlides } from '@ionic/angular';
import { BusesService } from 'src/app/services/firebase/buses.service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { IUserData } from '../../models/models'; 
import { map } from 'rxjs/operators';
import * as _ from 'lodash';

@Component({
  selector: 'app-stops-list',
  templateUrl: './stops-list.page.html',
  styleUrls: ['./stops-list.page.scss'],
})
export class StopsListPage implements OnInit {

  @ViewChild('slides',{static: false}) slides: IonSlides;

  stopPoints: any = [];
  routes: any = [];
  routeStops: any = [];
  currentRoute: any;
  currentRouteName: any;
  user: IUserData;
  loading = true;
  firstLoad = true;

  slideOpts = {
    slidesPerView: 1,
    autoHeight: true
  };

  constructor(public modalController: ModalController, private navParams: NavParams, private busesService: BusesService, private storageService: StorageService) {
    // this.stopPoints = this.navParams.get('stopPoints');
   }

  ngOnInit() {
    this.storageService.getItem('userData').then( (userData) => {
      this.user = JSON.parse(userData);
      this.getSubscriptions();
      this.firstLoad = true;
    })
  }

  ionSlideDidChange(event) {

    this.slides.getActiveIndex().then( (index) => {

      this.getStopPointsFromSelectedRoute(this.routes[index]);
    })
  }

  getSubscriptions() {
    this.busesService.getUserActiveRoutes(this.user).pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    ).subscribe( (routes) => {
      this.routes = routes;
      this.loading = false;
      if(this.firstLoad) {
        this.firstLoad = false;
        this.getStopPointsFromSelectedRoute(routes[0]);
      }
    });
  }

  getStopPointsFromSelectedRoute(route: any) {
    this.loading = true;
    this.currentRoute = route.id;
    this.currentRouteName = route.name;
    this.routeStops = [];
    this.busesService.getUserSelectedRouteActiveStops(this.user, route.id).pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    )
    .subscribe( (stops) => {
  
      this.routeStops = _.orderBy(stops, ['order'],['asc']);
      this.loading = false;
    })
  }

  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      'dismissed': true
    });
  }

  getSelectedStopPoint(stopPoint: any) {
    stopPoint.routeId = this.currentRoute;
    stopPoint.routeName = this.currentRouteName;
    this.modalController.dismiss({
      data: stopPoint
    })
  }

}
