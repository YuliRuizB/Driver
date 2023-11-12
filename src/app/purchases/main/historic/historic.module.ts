import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HistoricPageRoutingModule } from './historic-routing.module';

import { HistoricPage } from './historic.page';
import { NgxQRCodeModule } from 'ngx-qrcode2';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgxQRCodeModule,
    HistoricPageRoutingModule
  ],
  declarations: [HistoricPage]
})
export class HistoricPageModule {}
