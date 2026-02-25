import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardCard } from '../models/dashboard.interface';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:3000/dashboard';

  constructor(private http: HttpClient) {}

  getDashboardCards(): Observable<DashboardCard[]> {
    return this.http.get<DashboardCard[]>(`${this.apiUrl}/cards`);
  }
}
