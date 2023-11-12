import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { ProductDetailsPageRoutingModule } from './product-details-routing.module';
import { ProductDetailsPage } from './product-details.page';
import { StopPointsPage } from './stop-points/stop-points.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    ProductDetailsPageRoutingModule
  ],
  declarations: [ProductDetailsPage, StopPointsPage],
  entryComponents: [StopPointsPage]
})
export class ProductDetailsPageModule {}
