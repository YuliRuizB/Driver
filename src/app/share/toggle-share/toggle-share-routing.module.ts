import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ToggleSharePage } from './toggle-share.page';

const routes: Routes = [
  {
    path: '',
    component: ToggleSharePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ToggleSharePageRoutingModule {}
