import { Component, Input, OnInit } from '@angular/core';
import { Step } from '../models/step.model';

@Component({
  selector: 'app-steps-list',
  templateUrl: './steps-list.component.html',
  styleUrls: ['./steps-list.component.scss'],
})
export class StepsListComponent {
  @Input() steps: Step[] = [];
}
