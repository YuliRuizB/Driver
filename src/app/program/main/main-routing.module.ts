import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainPage } from './main.page';

const routes: Routes = [
  {
    path: '',
    component: MainPage
  },
  {
    path: 'scan/:id/:customerId/:routeId',
    loadChildren: () => import('./scan/scan.module').then( m => m.ScanPageModule)
  },
  {
    path: 'details/:id/:customerId',
    loadChildren: () => import('./details/details.module').then( m => m.DetailsPageModule)
  },
  {
    path: 'navigation/:id/:customerId/:routeId/:flyToZero',
    loadChildren: () => import('./navigation/navigation.module').then( m => m.NavigationPageModule)
  },
  {
    path: 'finish/:id/:customerId',
    loadChildren: () => import('./finish/finish.module').then( m => m.FinishPageModule)
  },
  {
    path: 'event-details/:id',
    loadChildren: () => import('./event-details/event-details.module').then( m => m.EventDetailsPageModule)
  },
  {
    path: 'historic',
    loadChildren: () => import('./historic/historic.module').then( m => m.HistoricPageModule)
  },
  {
    path: 'list',
    loadChildren: () => import('./list/list.module').then( m => m.ListPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainPageRoutingModule {}
