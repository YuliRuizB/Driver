import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class OsrmService {

  osrm = 'http://209.97.155.186:5000';
  service: string = 'route';
  version: string = 'v1';
  profile: string = 'driving';
  osrmURL: string = '';

  constructor(private http: HttpClient) { 
    this.osrmURL = `${this.osrm}/${this.service}/${this.version}`;
  }

  getTimeTravelDistance(profile: string, stationCoordinates: string, busCoordinates: string) {
    const setProfile = profile ? profile : this.profile;
    const request = `${this.osrmURL}/${setProfile}/${stationCoordinates};${busCoordinates}?overview=false`
    return this.http.get(request);
  }

  getRouteService(profile: string, coordinates: string) {
    const setProfile = profile ? profile : this.profile;
    const request = `${this.osrmURL}/${setProfile}/${coordinates}?steps=true&geometries=geojson`
    return this.http.get(request);
  }

  getTripService(profile: string, coordinates: any) {
    const setProfile = profile ? profile : this.profile;
    const request = `${this.osrm}/trip/${this.version}/${setProfile}/${coordinates}`;
    return this.http.get(request);
  }

  getMatchService(profile: string, coordinates: any, radiuses: string, timestamps: string) {
    const setProfile = profile ? profile : this.profile;
    //const request = `${this.osrm}/match/${this.version}/${setProfile}/${coordinates}?steps=true`;
    const request = `${this.osrm}/match/v1/driving/${coordinates}?overview=full&radiuses=${radiuses}&timestamps=${timestamps}&geometries=geojson`;
    return this.http.get(request);
  }
}

