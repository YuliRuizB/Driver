import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DriverEvidencePictureModalPageRoutingModule } from './driver-evidence-picture-modal-routing.module';

import { DriverEvidencePictureModalPage } from './driver-evidence-picture-modal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DriverEvidencePictureModalPageRoutingModule
  ],
  declarations: [DriverEvidencePictureModalPage]
})
export class DriverEvidencePictureModalPageModule {}
