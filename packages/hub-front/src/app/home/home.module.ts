import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { StepsModule } from '../steps/steps.module';
import { HomePageComponent } from './home-page/home-page.component';

@NgModule({
  declarations: [HomePageComponent],
  imports: [CommonModule, StepsModule],
  providers: [],
})
export class HomeModule {}
