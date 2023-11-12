import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NavigationPageRoutingModule } from './navigation-routing.module';

import { NavigationPage } from './navigation.page';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    NavigationPageRoutingModule,
    SharedModule
  ],
  declarations: [NavigationPage]
})
export class NavigationPageModule {}
