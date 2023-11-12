import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LocateStoreMapPageRoutingModule } from './locate-store-map-routing.module';

import { LocateStoreMapPage } from './locate-store-map.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LocateStoreMapPageRoutingModule
  ],
  declarations: [LocateStoreMapPage]
})
export class LocateStoreMapPageModule {}
