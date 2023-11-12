import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { HomePage } from './home.page';
import { StationInfoPage } from './station-info/station-info.page';
import { BusInfoPage } from './bus-info/bus-info.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomePage
      }
    ])
  ],
  declarations: [ HomePage, StationInfoPage, BusInfoPage ],
  entryComponents: [ StationInfoPage, BusInfoPage ]
})
export class HomePageModule {}
