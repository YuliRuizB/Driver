import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import * as mapboxgl from 'mapbox-gl';
import { LoadingController } from '@ionic/angular';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Storage } from '@ionic/storage-angular';
import { THEME_KEY } from './themeservice.service';
import { Geoposition } from '@awesome-cordova-plugins/geolocation';

@Injectable({
  providedIn: 'root'
})

export class MapService {

  mapbox = (mapboxgl as typeof mapboxgl);
  public map: mapboxgl.Map;
  lightStyle = `mapbox://styles/evallgar/cjrwc5l4503z51fldgomb8udg`;
  defaultStyle = `mapbox://styles/evallgar/cjrwc5l4503z51fldgomb8udg`;
  // defaultStyle = `mapbox://styles/evallgar/ck7ww9k9e0p251inm2hlzsw2p`;
  darModeStyle = `mapbox://styles/evallgar/ck7ww9k9e0p251inm2hlzsw2p`;
  lat = 25.778687;
  lng = -101.291794;
  zoom = 15;
  loading: HTMLIonLoadingElement;
  geolocate: any;
  geolocationSubscription: Subscription;
  currentLocation: any;
  THEME_KEY = THEME_KEY;
  isDarkMode: boolean = false;

  constructor(public loadingController: LoadingController, private geolocation: Geolocation, private storage: Storage) {
    this.mapbox.accessToken = environment.mapBoxToken;

    this.storage.get(THEME_KEY).then( darkMode => {
      this.isDarkMode = !!darkMode;
      this.defaultStyle = darkMode ? this.darModeStyle : this.lightStyle;
    })
    this.geolocationSubscription = this.geolocation.watchPosition().pipe(
      filter((position) => (position as Geoposition).coords !== undefined)
      ).subscribe((position: Geoposition) => {
        console.log(position.coords.longitude + ' ' + position.coords.latitude);
        this.currentLocation = position;
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
    });
  }

  buildMap() {
    this.map = new mapboxgl.Map({
      container: 'map',
      style: this.defaultStyle,
      center: [this.lng, this.lat],
      zoom: 15.5,
      pitch: 45,
      bearing: -17.6,
      antialias: true
    });
    this.map.addControl(new mapboxgl.NavigationControl(), 'bottom-left');
    this.addLayer(this.map);
    this.geolocateControl(this.map);
    // this.addGEOLine(this.map, 'route');
    // this.addGeopointsLayer(this.map, 'points');
    this.map.resize();
  }

  geolocateControl(map: mapboxgl.Map) {
    this.geolocate = map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showAccuracyCircle: true
    }), 'bottom-left');
  }

  removeSource(map: mapboxgl.Map, source: string) {

    if (map.getLayer(source)) {
      map.removeLayer(source);
    }
    if (map.getSource(source)) {
      map.removeSource(source);
    }
  }

  flyTo(map: mapboxgl.Map, stop: any) {
    map.flyTo({
      center: [stop.geopoint.longitude, stop.geopoint.latitude],
      essential: true
    });
  }

  addGEOLine(map: mapboxgl.Map, source: string, coordinates: Array<any>, flyToZero?: boolean) {
		console.log('addGeo')
    console.log(flyToZero);
		console.log(coordinates)
    var mapLayer = map.getLayer(source);
    const shouldFlyToZero = true; // flyToZero || false;

    if(typeof mapLayer !== 'undefined') {
      // Remove map layer & source.
      map.removeLayer('route').removeSource('route');
      return;
    }

    map.addSource(source, {
      'type': 'geojson',
      'data': {
        'type': 'Feature',
        'properties': {},
        'geometry': {
          'type': 'LineString',
          'coordinates': coordinates
        }
      }
    });
    map.addLayer({
      'id': source,
      'type': 'line',
      'source': source,
      'layout': {
        'line-join': 'round',
        'line-cap': 'round'
      },
      'paint': {
        'line-color': '#3880ff',
        'line-width': 8,
        'line-opacity': 0.6
      }
    });

    if(shouldFlyToZero) {
      console.log('should fly to zero', coordinates[0]);
			console.log([this.lng, this.lat])
      map.flyTo({
        center: [coordinates[0][0], coordinates[0][1]], // coordinates[0],
        essential: true
      });
    } else {
      console.log('should NOT fly to zero', this.lng, this.lat);
      //this.geolocate.trigger();
      map.flyTo({
        center: [this.lng, this.lat] || coordinates[0],
        essential: true
      });
    }
		
		// map.polyline(encodeString, style).addTo(this.map);
    
  }

  addLayer(map: mapboxgl.Map, ) {
		console.log('add layerrrrrrr')
    map.on('load', function () {
      // Insert the layer beneath any symbol layer.
      var layers = map.getStyle().layers as any;

      var labelLayerId;
      for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
          labelLayerId = layers[i].id;
          break;
        }
      }

      map.addLayer(
        {
          'id': '3d-buildings',
          'source': 'composite',
          'source-layer': 'building',
          'filter': ['==', 'extrude', 'true'],
          'type': 'fill-extrusion',
          'minzoom': 15,
          'paint': {
            'fill-extrusion-color': '#aaa',

            // use an 'interpolate' expression to add a smooth transition effect to the
            // buildings as the user zooms in
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
          }
        },
        labelLayerId
      );
    });
  }

  addGeopointsLayer(map: mapboxgl.Map, source: string, features: any) {

    var mapLayer = map.getLayer(source);

    if(typeof mapLayer !== 'undefined') {
      // Remove map layer & source.
      // map.removeLayer('route').removeSource('route');
      return;
    }

    map.addSource(source, {
      'type': 'geojson',
      'data': {
        'type': 'FeatureCollection',
        'features': features
      }
    });

    console.log('isDarkMode ?', this.isDarkMode);

    map.addLayer({
      'id': source,
      'type': 'symbol',
      'source': source,
      'layout': {
        // get the icon name from the source's "icon" property
        // concatenate the name to get an icon from the style's sprite sheet
        'icon-image': ['concat', ['get', 'icon'], ''],
        'icon-allow-overlap': true,
        // get the title name from the source's "title" property
        'text-field': ['get', 'title'],
        'text-allow-overlap': true,
        'text-font': ['Product Sans Regular', 'Arial Unicode MS Bold'],
        'text-offset': [0, 1.6],
        'text-anchor': 'top'
      },
      'paint': {
        'text-color': this.isDarkMode ? '#b0b0b0' : '#000',
        'text-halo-color': this.isDarkMode ? 'rgba(13,13,13,1)' : 'rgba(0,0,0,0)',
        'text-halo-width': 1,
        'text-halo-blur': 1
      }
    });

  }

  async presentLoading(message: string) {
    this.loading = await this.loadingController.create({
      message,
      spinner: 'lines',
      translucent: true
    });

    await this.loading.present();
  }

}
