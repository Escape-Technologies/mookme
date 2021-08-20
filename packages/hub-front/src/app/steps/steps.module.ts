import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepsListComponent } from './steps-list/steps-list.component';
import { StepComponent } from './step/step.component';
import { StepPageComponent } from './step-page/step-page.component';
import { StepsService } from './services/steps.service';
import { HttpClientModule } from '@angular/common/http';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  declarations: [StepsListComponent, StepComponent, StepPageComponent],
  providers: [StepsService],
  imports: [CommonModule, HttpClientModule, TooltipModule],
  exports: [StepsListComponent],
})
export class StepsModule {}
