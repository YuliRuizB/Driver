import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BoardingpassReportPage } from './boardingpass-report.page';

const routes: Routes = [
  {
    path: '',
    component: BoardingpassReportPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BoardingpassReportPageRoutingModule {}
