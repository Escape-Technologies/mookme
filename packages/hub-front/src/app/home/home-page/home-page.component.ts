import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Step } from 'src/app/steps/models/step.model';
import { StepsService } from 'src/app/steps/services/steps.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit {
  constructor(private readonly stepsService: StepsService) {}

  latestSteps$: Observable<Step[]> = of();

  ngOnInit(): void {
    this.latestSteps$ = this.stepsService.fetchLatestSteps();
  }
}
