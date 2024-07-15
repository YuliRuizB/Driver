import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ShowImageModalPage } from './show-image-modal.page';

const routes: Routes = [
  {
    path: '',
    component: ShowImageModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShowImageModalPageRoutingModule {}
