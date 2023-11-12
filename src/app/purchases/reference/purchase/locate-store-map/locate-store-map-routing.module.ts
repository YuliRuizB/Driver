import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LocateStoreMapPage } from './locate-store-map.page';

const routes: Routes = [
  {
    path: '',
    component: LocateStoreMapPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LocateStoreMapPageRoutingModule {}
