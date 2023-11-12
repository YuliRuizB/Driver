import { Component, OnInit, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import { Map, latLng, tileLayer, Layer, marker } from 'leaflet';
import 'leaflet-rotatedmarker';
import 'leaflet.marker.slideto';
import { NavParams, ModalController } from '@ionic/angular';
import { BusesService } from 'src/app/services/firebase/buses.service';
import { IUserData } from 'src/app/models/models';
import { StorageService } from 'src/app/services/storage/storage.service';
import { map, take } from 'rxjs/operators';
import { OsrmService } from 'src/app/services/osrm/osrm.service';
import { formatDistance, formatDistanceToNow } from 'date-fns';
import esLocale from 'date-fns/locale/es';
import { BusInfoPage } from '../bus-info/bus-info.page';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-station-info',
  templateUrl: './station-info.page.html',
  styleUrls: ['./station-info.page.scss'],
})
export class StationInfoPage implements OnInit, OnDestroy {

  station: any = {};
  stationMap: Map;
  routeId: any;
  user: IUserData;
  busesList: any = [];
  markers: any = [];
  busesSubscription: Subscription;

  constructor(private navParams: NavParams, public modalController: ModalController, private osrmService: OsrmService, private busesService: BusesService, private storageService: StorageService) { 
    this.station = this.navParams.get('station');
    this.routeId = this.navParams.get('routeId');
    console.log(this.routeId);
    console.log(this.station);
  }

  ngOnInit() {
    this.loadMap();
    this.storageService.getItem('userData').then( (userData) => {
      this.user = JSON.parse(userData);
      this.getSubscriptions();
    })
  }

  ngOnDestroy() {
    if(this.busesSubscription) {
      this.busesSubscription.unsubscribe();
    }
  }

  getSubscriptions() {
    this.busesSubscription = this.busesService.getLiveBusesRoute(this.user, this.routeId).pipe(
      take(1),
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    ).subscribe((buses) => {
      this.busesList = [];
      buses.forEach(device => {
        this.getTimeTravelDistance(device).then( (data:any) => {
          device.osrm = data;
          device.distance = Number((data.routes[0].distance)/1000).toFixed(2);
          device.duration = formatDistance(0, data.routes[0].duration * 1000, { includeSeconds: true, locale: esLocale });
          device.occupancy = (device.count * 100) / device.capacity;
          device.occupancyColor = device.occupancy > 75 ? device.occupancy === 100 ? 'danger': 'warning' : 'success';
          device.occupancyIcon = device.occupancy > 75 ? device.occupancy === 100 ? 'close-circle': 'alert-circle' : 'checkmark-circle';
          this.busesList.push(device);
          console.log(this.busesList);

          const latLng = [device.geopoint.latitude, device.geopoint.longitude];
            const iconUrl = device.occupancy > 75 ? device.occupancy === 100 ? 'assets/icon/marker_bus_danger.png': 'assets/icon/marker_bus_warning.png' : 'assets/icon/marker_bus_success.png';
            const motion = device.speed == 0 ? false : true;
            const assignedRoute = device.routeName;
            const time = formatDistanceToNow(
              // new Date(device.date.toDate()),
              new Date(),
              {locale: esLocale,
              addSuffix: true}
            );
            const customPopup = `
              Unidad: <strong>${device.vehicleName}</strong><br/>
              Ruta: <strong>${assignedRoute}</strong><br/>
              Actualizado: <strong>${time}</strong><br/>
              `;
              // specify popup options
              const customOptions = {
                maxWidth: '500',
                className: 'custom'
              };
              if (!this.markers[device.imei]) {
                // If there is no marker with this id yet, instantiate a new one.
                this.markers[device.imei] = L.marker([device.geopoint.latitude, device.geopoint.longitude], {
                  icon: L.icon({
                    // tslint:disable-next-line: max-line-length
                    iconUrl,
                    iconSize: [40, 40],
                    iconAnchor: [40, 40],
                    popupAnchor: [-20, -20],
                    shadowUrl: 'assets/icon/drop_shadow_bus.png',
                    shadowRetinaUrl: 'assets/icon/drop_shadow_bus.png',
                    shadowSize: [45, 45],
                    shadowAnchor: [45,27]
                  }),
                  // rotationAngle: position.course,
                  // rotationOrigin: 'center center'
                }).addTo(this.stationMap)
                  .bindPopup(customPopup); // , customOptions);
              } else {
                // If there is already a marker with this id, simply modify its position.
                this.markers[device.imei].slideTo(latLng, {
                  duration: 2000,
                  keepAtCenter: false
                })
                  .setRotationAngle(device.orientation)
                  .setRotationOrigin('center center')
                  .setPopupContent(customPopup, customOptions);
                // this.markers[position.deviceId].setLatLng(latLng).setPopupContent(customPopup, customOptions);
              }
        });
      })
    });
  }

  getTimeTravelDistance(currentBusLocation: any) {
    let stationCoordinates = `${this.station.geopoint.longitude},${this.station.geopoint.latitude}`;
    let busCoordinates = `${currentBusLocation.geopoint.longitude},${currentBusLocation.geopoint.latitude}`;
    return this.osrmService.getTimeTravelDistance('car', stationCoordinates, busCoordinates).toPromise().then( (data) => {
      console.log('data returned from osrmService', data);
        return data;
    }, err => console.log(err));
  }

  loadMap() {
    console.log(this.station.geopoint.longitude);
    this.stationMap = new Map("station_map").setView([this.station.geopoint.latitude, this.station.geopoint.longitude], 18);
    this.stationMap.whenReady( () => {
      setTimeout(() => {
        this.stationMap.invalidateSize(true);
      }, 100);
    });
    this.stationMap.zoomControl.remove();
    tileLayer('https://mt0.google.com/vt/lyrs=m&hl=es&x={x}&y={y}&z={z}&s=Ga', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      // style: 'https://api.maptiler.com/maps/1ddaeb93-5681-4398-ac48-bba52a074fd3/?key=crAqHWwNhI6CF3sWYjMT#'
    }).addTo(this.stationMap);
    this.setMarker();
    
    
  }

  updateDevices() {
    if(true) { //this.canShowDevices()
      
      console.log(this.user.defaultRoute);
      this.busesService.getLiveBusesRoute(this.user, this.user.defaultRoute).pipe(take(1),
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as any;
          const id = a.payload.doc.id;
          return { id, ...data };
        }))
      ).subscribe((devices) => {
        console.log(devices);
          devices.forEach( (device:any) => {
            
          });
        });
    }
  }

  setMarker() {
    L.marker([this.station.geopoint.latitude, this.station.geopoint.longitude], {
      icon: L.icon({
        // tslint:disable-next-line: max-line-length
        iconUrl: this.station.iconUrl ? this.station.iconUrl : 'assets/icon/pin_station.png',
        iconSize: [30, 30],
        iconAnchor: [30, 30],
        popupAnchor: [-15, -30],
        shadowUrl: 'assets/icon/drop_shadow_bus.png',
        shadowRetinaUrl: 'assets/icon/drop_shadow_bus.png',
        shadowSize: [50, 50],
        shadowAnchor: [35,27]
      }),
      // rotationAngle: 147,
      // rotationOrigin: 'center center'
    }).addTo(this.stationMap)
      .bindPopup(this.station.description);
      // .openPopup();

  }

  modalDismiss() {
    this.modalController.dismiss({
      'dismissed': true
    });
  }

  async getBusInfo(bus: any) {
    const modal = await this.modalController.create({
      component: BusInfoPage,
      swipeToClose: true,
      presentingElement: await this.modalController.getTop(),
      componentProps: {
        busId: bus.id,
        routeId: this.routeId,
        bus
      }
    });

    await modal.present();
  }

}
