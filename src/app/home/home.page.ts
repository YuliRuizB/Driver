import { Component, OnInit } from "@angular/core";
import * as L from "leaflet";
import { Map, tileLayer } from "leaflet";
import "leaflet-rotatedmarker";
import "leaflet.marker.slideto";
import { OnemapService } from "../services/data/onemap.service";
import { Geolocation } from "@ionic-native/geolocation/ngx";
import {
  ToastController,
  ModalController,
  AlertController,
  IonRouterOutlet,
} from "@ionic/angular";
import * as _ from "lodash";
import {
  setHours,
  isWithinInterval,
  formatDistance,
  formatDistanceToNow,
} from "date-fns";
import { BusesService } from "../services/firebase/buses.service";
import { map, take, filter } from "rxjs/operators";
import { UsersService } from "../services/firebase/users.service";
import { StorageService } from "../services/storage/storage.service";
import { StationInfoPage } from "./station-info/station-info.page";
import { FCM } from "@ionic-native/fcm/ngx";
import { OsrmService } from "../services/osrm/osrm.service";
import esLocale from "date-fns/locale/es";

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"],
})
export class HomePage implements OnInit {
  loading = true;
  user: any;
  map: Map;
  geofences: any;
  devices: any = [];
  markers: any = [];
  routes: any;
  routeStops: any = [];
  routeStopsList: any = [];
  asyncProcess = false;
  timer = null;
  autoUpdateStatus = false;
  showDevices = false;
  cards: any;
  showToolbar = false;
  stationsMarkers: L.LayerGroup<any>;
  busesMarkers: L.LayerGroup<any>;

  sliderConfig = {
    slidesPerView: 1.5,
    spaceBetween: 1,
    centeredSlides: true,
  };
  userGeoLocation: any;
  hasUserGeoLocation = false;

  constructor(
    private apiService: OnemapService,
    private geolocation: Geolocation,
    public toastController: ToastController,
    public modalController: ModalController,
    private busesService: BusesService,
    public alertController: AlertController,
    private usersService: UsersService,
    private storageService: StorageService,
    private fcm: FCM,
    private osrmService: OsrmService,
    private routerOutlet: IonRouterOutlet
  ) { }

  ionViewDidEnter() {
    console.log("ionviewdidenter");
    this.storageService.getItem("userData").then((userData) => {
      this.user = JSON.parse(userData);
      // this.canShowDevices();
      this.getSubscriptions();
      this.validateToken();

      if (this.user && this.user.defaultRoute) {
        // this.showMapRoute();
      } else {
        this.requestDefaultRoute();
      }
    });
  }

  loadMapAfterSubscriptions() {
    this.map = new Map("mapId").setView([25.6739571, -100.3400463], 10);
    this.stationsMarkers = L.layerGroup().addTo(this.map);
    this.busesMarkers = L.layerGroup().addTo(this.map);
    this.asyncProcess = true;
    this.leafletMap();
    this.asyncProcess = false;
  }

  ngOnInit() {
    // this.apiService.getGeofences().then((geofences) => {
    //   this.apiService.getDevices().then((devices) => {
    //     this.devices = devices;
    //     this.geofences = geofences;
    //     this.asyncProcess = false;
    //   });
    // });
  }

  validateToken() {
    this.fcm.getToken().then((token) => {
      console.log("getToken() from homepage");
      this.usersService.registerToken(this.user.uid, token);
    });
    this.fcm.onTokenRefresh().subscribe((token) => {
      console.log("onTokenRefresh() from homepage");
      this.usersService.registerToken(this.user.uid, token);
    });
    this.fcm.getAPNSToken().then((token) => {
      console.log("getAPNSToken() from homepage");
      this.usersService.registerAPNSToken(this.user.uid, token);
    });
  }

  async requestDefaultRoute() {
    const alert = await this.alertController.create({
      header: "¿Qué ruta deseas ver?",
      message: "Aún no has seleccionado la ruta que utilizarás.",
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
          cssClass: "secondary",
          handler: (blah) => {
            console.log("Confirm Cancel: blah");
          },
        },
        {
          text: "Seleccionar",
          handler: () => {
            this.presentAlertRadio();
          },
        },
      ],
    });

    await alert.present();
  }

  async presentAlertRadio() {
    let inputs = [];
    this.routes.forEach((route) => {
      const element = {
        name: "radio1",
        type: "radio",
        label: route.name,
        value: route.id,
      };
      inputs.push(element);
    });

    const alert = await this.alertController.create({
      header: "Rutas",
      inputs: inputs,
      buttons: [
        {
          text: "Cancelar",
          role: "cancel",
          cssClass: "secondary",
          handler: () => {
            console.log("Confirm Cancel");
          },
        },
        {
          text: "Seleccionar",
          handler: (routeId) => {
            console.log(routeId);
            this.updateUserPreference({ defaultRoute: routeId }).then(() => {
              this.stationsMarkers.eachLayer((layer) => {
                this.stationsMarkers.removeLayer(layer);
              });
              this.showMapRoute();
            });
          },
        },
      ],
    });

    await alert.present();
  }

  updateUserPreference(preference: any) {
    this.user.defaultRoute = preference.defaultRoute;
    return this.usersService
      .updateUserPreference(this.user.id, preference)
      .then(() => {
        this.storageService.setItem("userData", JSON.stringify(this.user));
      });
  }

  updateUserGeolocation() {
    this.asyncProcess = true;
    console.log("update user geolocation");
    this.geolocation
      .getCurrentPosition()
      .then((resp) => {
        console.log(resp);
        this.userGeoLocation = resp;
        this.hasUserGeoLocation = true;
        this.updateTimeTravel();
      })
      .catch((error) => {
        // TODO: Send alarm to user;
        this.hasUserGeoLocation = false;
        this.presentToast(`No es posible obtener tu ubicación`, 2000, "danger");
        // // console.log('Error getting location', error);
      });

    const watch = this.geolocation.watchPosition();
    watch.subscribe((data: any) => {
      console.log(data);
      // this.updateTimeTravel();
      // const pulsingIcon = L.Icon.pulse({
      //   iconSize: [20, 20],
      //   color: 'blue',
      //   fillColor: 'blue',
      //   heartbeat: 2
      // });

      //tslint:disable-next-line: no-string-literal
      if (!this.markers["userPosition"]) {
        // If there is no marker with this id yet, instantiate a new one.
        // tslint:disable-next-line: no-string-literal
        this.markers["userPosition"] = L.marker(
          [data.coords.latitude, data.coords.longitude],
          {
            icon: L.icon({
              // tslint:disable-next-line: max-line-length
              iconUrl: "assets/icon/markeruser.png",
              iconSize: [40, 40],
              iconAnchor: [40, 40],
              popupAnchor: [-20, -40],
              shadowUrl: "assets/icon/drop_shadow_bus.png",
              shadowRetinaUrl: "assets/icon/drop_shadow_bus.png",
              shadowSize: [25, 25],
              shadowAnchor: [25, 25],
            }),
          }
        )
          .addTo(this.map)
          .bindPopup("¡Aquí estoy!");
      } else {
        // If there is already a marker with this id, simply modify its position.
        // tslint:disable-next-line: no-string-literal
        this.markers["userPosition"].slideTo(
          [data.coords.latitude, data.coords.longitude],
          {
            duration: 2000,
            keepAtCenter: false,
          }
        );
      }
      this.asyncProcess = false;
    });
  }

  getSubscriptions() {
    this.busesService
      .getUserActiveRoutes(this.user)
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data() as any;
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        )
      )
      .subscribe((routes) => {
        this.routes = routes;
        this.loadMapAfterSubscriptions();
        this.loading = false;
      });
  }

  canShowDevices() {
    return this.busesService
      .canShowDevices(this.user)
      .pipe(
        map((a) => {
          const data = a.payload.data() as any;
          const id = a.payload.id;
          return { id, ...data };
        })
      )
      .subscribe((customer) => {
        const canShowBuses = customer.canShowDevices
          ? customer.canShowDevices
          : false;
        const now = new Date();
        const start = setHours(now, customer.showFromHour);
        start.setMinutes(30);
        const end = setHours(now, customer.showToHour);
        end.setMinutes(30);
        const _isWithinInterval = isWithinInterval(now, {
          start: start,
          end: end,
        });
        this.showDevices = canShowBuses && _isWithinInterval;
      });
  }

  leafletMap() {
    // In setView add latLng and zoom

    this.map.zoomControl.remove();
    tileLayer("https://mt0.google.com/vt/lyrs=m&hl=es&x={x}&y={y}&z={z}&s=Ga", {
      maxZoom: 20,
      subdomains: ["mt0", "mt1", "mt2", "mt3"],
      // style: 'https://api.maptiler.com/maps/1ddaeb93-5681-4398-ac48-bba52a074fd3/?key=crAqHWwNhI6CF3sWYjMT#'
    }).addTo(this.map);

    this.map.whenReady(() => {
      console.log("map is ready");
      if (this.user && this.user.defaultRoute) {
        this.showMapRoute();
        this.startAutoUpdate();
      }
      this.updateUserGeolocation();
    });
  }

  async openModalStationInfo(stop: any) {
    const modal = await this.modalController.create({
      component: StationInfoPage,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
      componentProps: {
        routeId: this.user.defaultRoute,
        station: stop,
      },
    });

    await modal.present();
  }

  showMapRoute() {
    this.busesService
      .getUserRouteActiveStops(this.user)
      .pipe(
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data() as any;
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        )
      )
      .subscribe((routeStops) => {
        console.log(routeStops);
        this.routeStopsList = routeStops;
        this.addStopsToMap(this.routeStopsList);
        if (this.hasUserGeoLocation) {
          this.updateTimeTravel();
        }
      });
  }

  updateTimeTravel() {
    this.routeStopsList.forEach((routeStop) => {
      this.getTimeTravelDistance(routeStop).then((response: any) => {
        routeStop.distance =
          Number(response.routes[0].distance / 1000).toFixed(0) + " km";
        routeStop.duration = formatDistance(
          0,
          response.routes[0].duration * 1000,
          { includeSeconds: true, locale: esLocale }
        );
      });
    });
  }

  getTimeTravelDistance(station: any) {
    let userCoordinates = `${this.userGeoLocation.coords.longitude},${this.userGeoLocation.coords.latitude}`;
    let stationCoordinates = `${station.geopoint.longitude},${station.geopoint.latitude}`;
    return this.osrmService
      .getTimeTravelDistance("foot", stationCoordinates, userCoordinates)
      .pipe(take(1))
      .toPromise()
      .then((response) => {
        return response;
      });
  }

  addStopsToMap(stationsArray) {
    console.log(stationsArray);
    let arrayOfLatLngs = [];
    let coordinates = "";
    let radiuses = "";
    let timestamps = "";
    let count = 0;
    stationsArray.forEach((station) => {
      count += 1000;
      const customPopup = `
        <strong>${station.name}</strong><br/>
        ${station.description}<br/>
      `;

      coordinates += `${station.geopoint.longitude},${station.geopoint.latitude};`;
      radiuses += "49;";
      timestamps +=
        +(new Date().getTime() / 1000 + count * 60).toFixed(0) + ";";

      arrayOfLatLngs.push([
        station.geopoint.latitude,
        station.geopoint.longitude,
      ]);
      L.marker([station.geopoint.latitude, station.geopoint.longitude], {
        icon: L.icon({
          // tslint:disable-next-line: max-line-length
          iconUrl: station.iconUrl
            ? station.iconUrl
            : "assets/icon/pin_station.png",
          iconSize: [30, 30],
          iconAnchor: [30, 30],
          popupAnchor: [-15, -20],
          shadowUrl: "assets/icon/drop_shadow_bus.png",
          shadowRetinaUrl: "assets/icon/drop_shadow_bus.png",
          shadowSize: [45, 45],
          shadowAnchor: [45, 27],
        }),
        // rotationAngle: 147,
        // rotationOrigin: 'center center'
      })
        .addTo(this.stationsMarkers)
        .bindPopup(customPopup);
    });
    console.log(arrayOfLatLngs);
    let bounds =
      arrayOfLatLngs.length > 0 ? new L.LatLngBounds(arrayOfLatLngs) : [];

    // let polyline = (encode([[38.5, -120.2], [40.7, -120.95], [43.252, -126.453]]));

    this.osrmService
      .getMatchService(
        "driving",
        coordinates.substring(0, coordinates.length - 1),
        radiuses.substring(0, radiuses.length - 1),
        timestamps.substring(0, timestamps.length - 1)
      )
      .subscribe((response: any) => {
        console.log(response);
        let polylineArray = [];
        const tracepoints = response.matchings[0].geometry.coordinates;
        _.map(tracepoints, (point) => {
          console.log(typeof point);
          if (point.length > 0) {
            polylineArray.push([point[1], point[0]]);
          }
        });
        // create a red polyline from an array of LatLng points
        console.log(polylineArray);
        var style = {
          color: "#3880ff",
          weight: 8,
          opacity: 0.6,
        },
          stroke = {
            color: "#3171e0",
            weight: 10,
            opacity: 0.4,
          };
        L.polyline(polylineArray, style).addTo(this.map);
      });

    const boundsExists = arrayOfLatLngs.length > 0;
    if (boundsExists) {
      this.map.fitBounds(bounds);
      this.map.invalidateSize();
    }
  }

  updateDevices() {
    this.asyncProcess = true;

    this.busesService
      .getLiveBusesRoute(this.user, this.user.defaultRoute)
      .pipe(
        take(1),
        map((actions) =>
          actions.map((a) => {
            const data = a.payload.doc.data() as any;
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        )
      )
      .subscribe((devices) => {
        console.log(devices);

        if (this.devices.length > 0) {
          const currentDevices = _.map(devices, (a) => {
            return a.id;
          });
          console.log("this.device(s) is greather than 0");
          console.log(this.devices);
          console.log(currentDevices);
          const difference = _.difference(this.devices, currentDevices);
          if (difference.length > 0) {
            difference.forEach((device) => {
              console.log("difference ", device);
              this.markers[device].remove();
            });
          }
        }
        this.devices = _.map(devices, (a) => {
          return a.vehicleId;
        });
        devices.forEach((device: any) => {
          device.occupancy = (device.count * 100) / device.capacity;
          device.availability = device.capacity - device.count;
          device.occupancyColor =
            device.occupancy > 75
              ? device.occupancy === 100
                ? "danger"
                : "warning"
              : "success";
          device.occupancyIcon =
            device.occupancy > 75
              ? device.occupancy === 100
                ? "close-circle"
                : "alert-circle"
              : "checkmark-circle";

          const iconUrl =
            device.occupancy > 75
              ? device.occupancy === 100
                ? "assets/icon/marker_bus_danger.png"
                : "assets/icon/marker_bus_warning.png"
              : "assets/icon/marker_bus_success.png";

          const latLng = [device.geopoint.latitude, device.geopoint.longitude];

          const motion = device.speed == 0 ? false : true;
          const assignedRoute = device.routeName;
          const vehicleName = device.vehicleName;
          const driverName = device.driver;
          const time = formatDistanceToNow(
            // new Date(new Date()),
            new Date(device.lastUpdatedAt.toDate()),
            {
              locale: esLocale,
              addSuffix: true,
            }
          );
          const customPopup = `
              Unidad <strong>${vehicleName}</strong><br/>
              Conduce <strong>${driverName}</strong><br/>
              Actualizado: <strong>${time}</strong><br/>
              <strong>${device.availability} asientos disponibles</strong><br/>
              `;
          // specify popup options
          const customOptions = {
            maxWidth: "500",
            className: "custom",
          };

          // If there is no marker with this id yet, instantiate a new one.
          this.markers[device.vehicleId] = L.marker(
            [device.geopoint.latitude, device.geopoint.longitude],
            {
              icon: L.icon({
                // tslint:disable-next-line: max-line-length
                iconUrl,
                iconSize: [40, 40],
                iconAnchor: [40, 40],
                popupAnchor: [-20, -20],
                shadowUrl: "assets/icon/drop_shadow_bus.png",
                shadowRetinaUrl: "assets/icon/drop_shadow_bus.png",
                shadowSize: [45, 45],
                shadowAnchor: [45, 27],
              }),
            }
          )
            .addTo(this.map)
            .bindPopup(customPopup); // , customOptions);
        });
        this.asyncProcess = false;
      });
  }

  updateDevicesOnemap() {
    if (this.canShowDevices()) {
      this.asyncProcess = true;
      this.apiService.getDevices().then((devices) => {
        this.devices = devices;
        this.devices.forEach((device: any) => {
          if (device && device.positionId) {
            this.apiService
              .getPosition(device.positionId)
              .then((positionArray: any) => {
                const position = positionArray[0];
                // tslint:disable-next-line: no-shadowed-variable
                const latLng = [position.latitude, position.longitude];
                const motion =
                  position.attributes && position.attributes.motion
                    ? position.attributes.motion
                    : false;
                // tslint:disable-next-line: max-line-length
                // const iconUrl = 'https://firebasestorage.googleapis.com/v0/b/bus2u-834e8.appspot.com/o/assets%2Fbus-top-view-green.png?alt=media&token=d9262694-49bc-488f-a3b1-1d332d6c6ae0';
                const iconUrl = "assets/icon/marker_bus.png";
                // tslint:disable-next-line: max-line-length
                const assignedRoute =
                  device.attributes && device.attributes.assignedRoute
                    ? device.attributes.assignedRoute
                    : "Sin información";
                const time = formatDistanceToNow(
                  new Date(position.deviceTime),
                  {
                    locale: esLocale,
                    addSuffix: true,
                  }
                );
                // const time = '1231';
                // console.log(position);

                // create popup contents
                const customPopup = `
              Unidad: <strong>${device.name}</strong><br/>
              Ruta: <strong>${assignedRoute}</strong><br/>
              Actualizado: <strong>${time}</strong><br/>
              `;
                // specify popup options
                const customOptions = {
                  maxWidth: "500",
                  className: "custom",
                };

                if (!this.markers[position.deviceId]) {
                  // If there is no marker with this id yet, instantiate a new one.
                  this.markers[position.deviceId] = L.marker(
                    [position.latitude, position.longitude],
                    {
                      icon: L.icon({
                        // tslint:disable-next-line: max-line-length
                        iconUrl,
                        iconSize: [20, 60],
                        iconAnchor: [20, 60],
                        popupAnchor: [-20, -40],
                      }),
                      // rotationAngle: position.course,
                      // rotationOrigin: 'center center'
                    }
                  )
                    .addTo(this.map)
                    .bindPopup(customPopup); // , customOptions);
                } else {
                  // If there is already a marker with this id, simply modify its position.
                  this.markers[position.deviceId]
                    .slideTo(latLng, {
                      duration: 2000,
                      keepAtCenter: false,
                    })
                    .setRotationAngle(position.course)
                    .setRotationOrigin("center center")
                    .setPopupContent(customPopup, customOptions);
                  // this.markers[position.deviceId].setLatLng(latLng).setPopupContent(customPopup, customOptions);
                }
              });
          }
        });
        this.asyncProcess = false;
      });
    }
  }

  startAutoUpdate() {
    if (this.canShowDevices()) {
      if (this.timer != null) {
        return;
      }
      this.autoUpdateStatus = true;
      this.timer = setInterval(() => {
        this.updateDevices();
      }, 5000);
      this.presentToast("Actualización en vivo", 2000, "success");
    }
  }

  stopAutoUpdate() {
    clearInterval(this.timer);
    this.autoUpdateStatus = false;
    this.timer = null;
    this.presentToast("Actualización detenida", 2000, "light");
  }

  async filterOptions() {
    // const modal = await this.modalCtrl.create({
    //   component: FilterOptionsComponent
    // });
    // return await modal.present();
  }

  /** Remove map when we have multiple map object */
  ionViewWillLeave() {
    clearInterval(this.timer);
    this.timer = null;
    this.autoUpdateStatus = false;
    this.map.remove();
  }

  async presentToast(message: string, duration: number, color: string) {
    const toast = await this.toastController.create({
      message,
      duration,
      color,
    });
    toast.present();
  }
}
