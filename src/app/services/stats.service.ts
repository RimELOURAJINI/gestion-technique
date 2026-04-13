import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private apiUrl = 'http://localhost:8080/api/stats';

  constructor(private http: HttpClient) { }

  // Admin Stats
  getFinanceStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/finance`);
  }

  getAuditLogs(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/audit`);
  }

  // Manager Stats
  getTeamWorkload(managerId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/manager/planning/${managerId}`);
  }

  getPendingApprovals(managerId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/manager/approvals/${managerId}`);
  }

  getManagerDashboardStats(managerId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/manager/dashboard/${managerId}`);
  }

  // User Wellness
  updateWellness(userId: number, energyLevel: number, mood: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/user/wellness/${userId}`, { energyLevel, mood });
  }
}
