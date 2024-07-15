import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DriverEvidencePictureModalPage } from './driver-evidence-picture-modal.page';

const routes: Routes = [
  {
    path: '',
    component: DriverEvidencePictureModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DriverEvidencePictureModalPageRoutingModule {}
