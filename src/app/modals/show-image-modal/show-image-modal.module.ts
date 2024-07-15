import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ShowImageModalPageRoutingModule } from './show-image-modal-routing.module';

import { ShowImageModalPage } from './show-image-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShowImageModalPageRoutingModule
  ],
  declarations: [ShowImageModalPage]
})
export class ShowImageModalPageModule {}
