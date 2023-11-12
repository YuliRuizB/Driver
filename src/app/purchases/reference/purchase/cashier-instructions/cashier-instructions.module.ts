import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CashierInstructionsPageRoutingModule } from './cashier-instructions-routing.module';

import { CashierInstructionsPage } from './cashier-instructions.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CashierInstructionsPageRoutingModule
  ],
  declarations: [CashierInstructionsPage]
})
export class CashierInstructionsPageModule {}
