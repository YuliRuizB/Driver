import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(public http: HttpClient, private storage: Storage) {
    this.storage.create();
    this.appName();
  }

  HTTP_OPTIONS = {};
  APP_NAME = 'appName';
  HAS_LOGGED_IN = 'hasLoggedIn';
  HAS_SETUP_SERVER = 'hasSetupServer';
  HAS_SEEN_TUTORIAL = 'hasSeenTutorial';
  HAS_SEEN_SLIDING = 'hasSeenSliding';
  USER_DATA = 'user';
  USERID = 'id';
  SERVER_URL = 'serverUrl';
  USER_MAP_LAYER = 'userMapLayer';
  SERVER_MAP_LAYER = 'serverMapLayer';
  BASIC_AUTHORIZATION = 'basicAuthorization';

  GROUPS_FILTER_ENABLED = 'groupsFilterEnabled';
  GROUPS_FILTER = 'groupsFilter';

  GEOFENCES_FILTER_ENABLED = 'geofencesFilterEnabled';
  GEOFENCES_FILTER = 'geofencesFilter';

  isLoggedIn() {
    return this.storage.get(this.HAS_LOGGED_IN);
  }

  getMapLayerName() {
    return this.storage.get(this.USER_MAP_LAYER).then( (userMapLayer: any) => {
      if (userMapLayer) {
        return userMapLayer;
      } else {
        return this.storage.get(this.SERVER_MAP_LAYER).then( (serverMapLayer: any) => {
          return serverMapLayer;
        });
      }
    });
  }

  appName() {
    return this.storage.get(this.APP_NAME).then( (appName: string) => {
      return appName;
    });
  }

  setAppName(appName) {
    return this.storage.set(this.APP_NAME, appName).then( (result) => {
      // console.log(result);
    })
    .catch( error => {
      // console.log(error);
    });
  }

  storeInfo(data: any) {
    if (data && data.attributes) {
      for (const k in data) {
        if (data.hasOwnProperty(k)) {
          this.setItem(k, data[k]);
        }
      }
    }
  }

  setItem(storageKey, storageValue) {
    return this.storage.set(storageKey, storageValue);
  }

  getItem(storageKey) {
    return this.storage.get(storageKey);
  }

  getBasicAuthorization() {
    return this.storage.get(this.BASIC_AUTHORIZATION);
  }

  forceSettings() {
    return this.storage.clear();
  }
}
