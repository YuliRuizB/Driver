import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ToggleSharePageRoutingModule } from './toggle-share-routing.module';

import { ToggleSharePage } from './toggle-share.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ToggleSharePageRoutingModule
  ],
  declarations: [ToggleSharePage]
})
export class ToggleSharePageModule {}
