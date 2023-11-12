import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BusPage } from './bus.page';

const routes: Routes = [
  {
    path: 'bus',
    component: BusPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BusPageRoutingModule {}
