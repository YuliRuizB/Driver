import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UsageDetailsPage } from './usage-details.page';

const routes: Routes = [
  {
    path: '',
    component: UsageDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsageDetailsPageRoutingModule {}
