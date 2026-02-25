import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { DashboardCard } from '../models/dashboard.interface';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService extends BaseService {
  private readonly endpoint = `${this.baseUrl}/dashboard`;

  getDashboardCards(): Observable<DashboardCard[]> {
    return this.http.get<DashboardCard[]>(`${this.endpoint}/cards`)
      .pipe(catchError(err => this.handleError(err)));
  }
}
