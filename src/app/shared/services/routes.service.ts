import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, switchMap } from 'rxjs/operators';
import * as firebase from 'firebase/app';
import { combineLatest } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoutesService {

  constructor(private afs: AngularFirestore) { 
  }

  getRoutes(vendorId: string) {    
    return this.getRoutesArray(vendorId).pipe(
      map(actions => actions.map( a => {
        const id = a.payload.doc.id;
        const data = a.payload.doc.data();
        return data.routeId;
      })),
      switchMap(permissions => {        
        //return this.afs.collectionGroup('routes', ref => ref.where('routeId', 'in', permissions)).valueChanges();
        const chunkSize = 10;
        const chunkedPermissions = [];
        for (let i = 0; i < permissions.length; i += chunkSize) {
          chunkedPermissions.push(permissions.slice(i, i + chunkSize));
        }
        // Crear un array de observables para cada consulta
        const observables = chunkedPermissions.map(chunk => {
          return this.afs.collectionGroup('routes', ref => ref.where('routeId', 'in', chunk)).valueChanges();
        });
        // Combinar los resultados de las consultas en un solo observable
        return combineLatest(observables);

      })
    );
  }

  getRoutesArray(vendorId: string) {  
    const routesAccess = this.afs.collection('vendors').doc(vendorId)
  .collection('routesAccess', ref => ref.where('active', '==', true));
    return routesAccess.snapshotChanges();
  }
}
