import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationMapComponent } from './components/navigation-map/navigation-map.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [NavigationMapComponent],
  imports: [
    CommonModule,
    HttpClientModule,
  ],
  exports: [
    NavigationMapComponent
  ]
})
export class SharedModule { }
