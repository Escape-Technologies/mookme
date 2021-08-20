import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Step } from '../models/step.model';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable()
export class StepsService {
  constructor(private http: HttpClient) {}
  fetchLatestSteps(): Observable<Step[]> {
    return this.http.get<Step[]>(`${environment.backendUrl}/steps/latest`).pipe(
      catchError((err) => {
        console.log(err);
        return [];
      })
    );
  }
}
