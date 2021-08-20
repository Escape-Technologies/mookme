import { Component, Input, OnInit } from '@angular/core';
import { Step } from '../models/step.model';

@Component({
  selector: 'app-step',
  templateUrl: './step.component.html',
  styleUrls: ['./step.component.scss'],
})
export class StepComponent {
  @Input() step?: Step;

  constructor() {}
}
