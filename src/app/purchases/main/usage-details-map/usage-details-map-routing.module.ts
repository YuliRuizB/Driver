import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UsageDetailsMapPage } from './usage-details-map.page';

const routes: Routes = [
  {
    path: '',
    component: UsageDetailsMapPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsageDetailsMapPageRoutingModule {}
