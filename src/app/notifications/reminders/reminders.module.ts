import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RemindersPageRoutingModule } from './reminders-routing.module';

import { RemindersPage } from './reminders.page';
import { StopsListPage } from '../stops-list/stops-list.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RemindersPageRoutingModule
  ],
  declarations: [RemindersPage, StopsListPage],
  entryComponents: [StopsListPage]
})
export class RemindersPageModule {}
