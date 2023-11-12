import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SharePage } from './share.page';

const routes: Routes = [
  {
    path: '',
    component: SharePage
  },
  {
    path: 'toggle-share',
    loadChildren: () => import('./toggle-share/toggle-share.module').then( m => m.ToggleSharePageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SharePageRoutingModule {}
