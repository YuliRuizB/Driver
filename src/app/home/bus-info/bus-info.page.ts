import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-bus-info',
  templateUrl: './bus-info.page.html',
  styleUrls: ['./bus-info.page.scss'],
})
export class BusInfoPage implements OnInit {

  station: any = {};
  busId: any;
  bus: any;
  deviceMap: Map;
  routeId: any;
  user: IUserData;
  busesList: any = [];
  markers: any = [];

  constructor(private navParams: NavParams, public modalController: ModalController, private osrmService: OsrmService, private busesService: BusesService, private storageService: StorageService) {
    this.busId = this.navParams.get('busId');
    this.bus = this.navParams.get('bus');
    this.routeId = this.navParams.get('routeId');
    console.log(this.bus);
  }

  ngOnInit() {
    this.loadMap();
    this.storageService.getItem('userData').then((userData) => {
      this.user = JSON.parse(userData);
      this.getSubscriptions();
    })
  }

  getSubscriptions() {
    this.busesService.getLiveBusRoute(this.bus).pipe(
      take(1),
    ).subscribe((bus: any) => {
      console.log(bus);
      this.bus = bus;
      const device = bus;
      const latLng = [device.geopoint.latitude, device.geopoint.longitude];
      const iconUrl = 'assets/icon/marker_bus.png';
      const motion = device.speed == 0 ? false : true;
      const assignedRoute = device.routeName;
      const time = formatDistanceToNow(
        new Date(device.date.toDate()),
        {
          locale: esLocale,
          addSuffix: true
        }
      );
      const customPopup = `
              Unidad: <strong>${device.name}</strong><br/>
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
            shadowAnchor: [45, 27]
          }),
          // rotationAngle: position.course,
          // rotationOrigin: 'center center'
        }).addTo(this.deviceMap)
          .bindPopup(customPopup); // , customOptions);
      } else {
        // If there is already a marker with this id, simply modify its position.
        this.markers[device.imei].slideTo(latLng, {
          duration: 2000,
          keepAtCenter: false
        })
        // .setRotationAngle(device.orientation)
        // .setRotationOrigin('center center')
        // .setPopupContent(customPopup, customOptions);
        // this.markers[position.deviceId].setLatLng(latLng).setPopupContent(customPopup, customOptions);
      }
      // this.busesList = [];
      // bus.forEach(device => {
      //   this.getTimeTravelDistance(device).then( (data:any) => {
      //     device.osrm = data;
      //     device.distance = Number((data.routes[0].distance)/1000).toFixed(2);
      //     device.duration = formatDistance(0, data.routes[0].duration * 1000, { includeSeconds: true, locale: esLocale });
      //     this.busesList.push(device);


      //   });
      // })
    });
  }

  getTimeTravelDistance(currentBusLocation: any) {
    let stationCoordinates = `${this.station.geopoint.longitude},${this.station.geopoint.latitude}`;
    let busCoordinates = `${currentBusLocation.geopoint.longitude},${currentBusLocation.geopoint.latitude}`;
    return this.osrmService.getTimeTravelDistance('car', stationCoordinates, busCoordinates).toPromise().then((data) => {
      return data;
    })
  }

  loadMap() {
    // console.log(this.station.geopoint.longitude);
    this.deviceMap = new Map("device_map").setView([this.bus.geopoint.latitude, this.bus.geopoint.longitude], 18);
    this.deviceMap.whenReady(() => {
      setTimeout(() => {
        this.deviceMap.invalidateSize(true);
      }, 100);
    });
    this.deviceMap.zoomControl.remove();
    tileLayer('https://mt0.google.com/vt/lyrs=m&hl=es&x={x}&y={y}&z={z}&s=Ga', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      // style: 'https://api.maptiler.com/maps/1ddaeb93-5681-4398-ac48-bba52a074fd3/?key=crAqHWwNhI6CF3sWYjMT#'
    }).addTo(this.deviceMap);
    // this.setMarker();


  }

  modalDismiss() {
    this.modalController.dismiss({
      'dismissed': true
    });
  }

}
