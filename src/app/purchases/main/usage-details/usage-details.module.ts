import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UsageDetailsPageRoutingModule } from './usage-details-routing.module';

import { UsageDetailsPage } from './usage-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UsageDetailsPageRoutingModule
  ],
  declarations: [UsageDetailsPage]
})
export class UsageDetailsPageModule {}
