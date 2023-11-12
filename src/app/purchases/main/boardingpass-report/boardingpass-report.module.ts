import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BoardingpassReportPageRoutingModule } from './boardingpass-report-routing.module';

import { BoardingpassReportPage } from './boardingpass-report.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BoardingpassReportPageRoutingModule
  ],
  declarations: [BoardingpassReportPage]
})
export class BoardingpassReportPageModule {}
