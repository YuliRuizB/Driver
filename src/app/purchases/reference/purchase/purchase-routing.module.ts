import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PurchasePage } from './purchase.page';

const routes: Routes = [
  {
    path: '',
    component: PurchasePage
  },
  {
    path: 'payment',
    loadChildren: () => import('./payment/payment.module').then( m => m.PaymentPageModule)
  },
  {
    path: 'locate-store-map',
    loadChildren: () => import('./locate-store-map/locate-store-map.module').then( m => m.LocateStoreMapPageModule)
  },
  {
    path: 'how-to-pay',
    loadChildren: () => import('./how-to-pay/how-to-pay.module').then( m => m.HowToPayPageModule)
  },
  {
    path: 'cashier-instructions',
    loadChildren: () => import('./cashier-instructions/cashier-instructions.module').then( m => m.CashierInstructionsPageModule)
  },
  {
    path: 'stores',
    loadChildren: () => import('./stores/stores.module').then( m => m.StoresPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PurchasePageRoutingModule {}
