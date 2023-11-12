import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UsageDetailsMapPageRoutingModule } from './usage-details-map-routing.module';

import { UsageDetailsMapPage } from './usage-details-map.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UsageDetailsMapPageRoutingModule
  ],
  declarations: [UsageDetailsMapPage]
})
export class UsageDetailsMapPageModule {}
