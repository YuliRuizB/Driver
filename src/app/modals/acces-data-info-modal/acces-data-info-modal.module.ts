import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AccesDataInfoModalPageRoutingModule } from './acces-data-info-modal-routing.module';

import { AccesDataInfoModalPage } from './acces-data-info-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AccesDataInfoModalPageRoutingModule
  ],
  declarations: [AccesDataInfoModalPage]
})
export class AccesDataInfoModalPageModule {}
