import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HowToPayPage } from './how-to-pay.page';

const routes: Routes = [
  {
    path: '',
    component: HowToPayPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HowToPayPageRoutingModule {}
