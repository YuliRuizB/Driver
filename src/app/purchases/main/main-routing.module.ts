import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainPage } from './main.page';

const routes: Routes = [
  {
    path: '',
    component: MainPage
  },
  {
    path: 'usage-details/:id',
    loadChildren: () => import('./usage-details/usage-details.module').then( m => m.UsageDetailsPageModule)
  },
  {
    path: 'usage-details-map/:id',
    loadChildren: () => import('./usage-details-map/usage-details-map.module').then( m => m.UsageDetailsMapPageModule)
  },
  {
    path: 'boardingpass-report/:id',
    loadChildren: () => import('./boardingpass-report/boardingpass-report.module').then( m => m.BoardingpassReportPageModule)
  },
  {
    path: 'historic',
    loadChildren: () => import('./historic/historic.module').then( m => m.HistoricPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainPageRoutingModule {}
