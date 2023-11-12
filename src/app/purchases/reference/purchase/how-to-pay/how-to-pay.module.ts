import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HowToPayPageRoutingModule } from './how-to-pay-routing.module';

import { HowToPayPage } from './how-to-pay.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HowToPayPageRoutingModule
  ],
  declarations: [HowToPayPage]
})
export class HowToPayPageModule {}
