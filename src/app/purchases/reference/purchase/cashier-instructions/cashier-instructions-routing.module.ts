import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CashierInstructionsPage } from './cashier-instructions.page';

const routes: Routes = [
  {
    path: '',
    component: CashierInstructionsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CashierInstructionsPageRoutingModule {}
