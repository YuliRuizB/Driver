import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccesDataInfoModalPage } from './acces-data-info-modal.page';

const routes: Routes = [
  {
    path: '',
    component: AccesDataInfoModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccesDataInfoModalPageRoutingModule {}
