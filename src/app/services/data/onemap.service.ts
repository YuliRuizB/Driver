import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Device } from '../../models/models';
import { StorageService } from '../../services/storage/storage.service';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class OnemapService {

  httpOptions: any = {};
  apiUrl = 'http://gps.onemap7.com/api/';
  serverMapLayer = 'https://mt0.google.com/vt/lyrs=m&ml=es&x={x}&y={y}&z={z}&s=Ga';
  device: Device;
  email = 'bus2u@grabita.com';
  password = 'bus2ugrabita';

  constructor(
      public alertCtrl: AlertController,
      private storageProvider: StorageService,
      private storage: Storage,
      public http: HttpClient
    ) {
      this.storage.set(this.storageProvider.BASIC_AUTHORIZATION, btoa(`${this.email}:${this.password}`));
  }

  getGeofences() {
    const url = this.apiUrl + 'geofences';
    // // console.log("url: ", url);
    return new Promise((resolve, reject) => {
      this.storageProvider.getItem(this.storageProvider.BASIC_AUTHORIZATION).then((basic) => {
        this.httpOptions = {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            authorization: basic
          })
        };
        this.http.get(url, this.httpOptions).subscribe(data => {
          resolve(data);
        }, err => {
          reject(err);
        });
      });
    });
  }

  getDevices() {
    const url = this.apiUrl + 'devices';
    return new Promise(resolve => {
      this.storageProvider.getBasicAuthorization().then((basic) => {
        this.httpOptions = {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            authorization: basic
          })
        };
        this.http.get(url, this.httpOptions).subscribe(data => {
          resolve(data);
        }, err => {
          // // console.log(err);
        });
      });
    });
  }

  getDevice(id: string) {
    const url = this.apiUrl + 'devices' + '?id=' + id;
    return new Promise(resolve => {
      this.storageProvider.getBasicAuthorization().then((basic) => {
        this.httpOptions = {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            authorization: basic
          })
        };
        this.http.get(url, this.httpOptions).subscribe(data => {
          resolve(data);
          // // console.log(data);
        }, err => {
          // // console.log(err);
        });
      });
    });
  }

  getPosition(parameter: number) {
    const params = 'id=' + parameter + '&';
    const url = this.apiUrl + 'positions?' + params;
    // // console.log("url: ", url);
    return new Promise((resolve, reject) => {
      this.storageProvider.getItem(this.storageProvider.BASIC_AUTHORIZATION).then((basic) => {
        this.httpOptions = {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            authorization: basic
          })
        };
        this.http.get(url, this.httpOptions).subscribe(data => {
          resolve(data);
        }, err => {
          reject(err);
        });
      });
    });
  }

  getPositions(name: string, parameter: number, from: string, to: string) {
    const params = name + '=' + parameter + '&from=' + from + '&to=' + to;
    const url = this.apiUrl + 'positions?' + params;
    // // console.log("url: ", url);
    return new Promise((resolve, reject) => {
      this.storageProvider.getItem(this.storageProvider.BASIC_AUTHORIZATION).then((basic) => {
        this.httpOptions = {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            authorization: basic
          })
        };
        this.http.get(url, this.httpOptions).subscribe(data => {
          resolve(data);
        }, err => {
          reject(err);
        });
      });
    });
  }

}
