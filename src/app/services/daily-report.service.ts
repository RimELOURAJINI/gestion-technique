import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DailyReport, DailyReportSummary } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class DailyReportService {
  private apiUrl = 'http://localhost:8080/api/daily-reports';

  constructor(private http: HttpClient) {}

  /** Soumettre (créer) le rapport du jour */
  submitReport(report: DailyReport): Observable<DailyReport> {
    return this.http.post<DailyReport>(this.apiUrl, report);
  }

  /** Récupérer mon rapport du jour */
  getMyReport(userId: number): Observable<DailyReport | null> {
    return this.http.get<DailyReport>(`${this.apiUrl}/my?userId=${userId}`).pipe(
      catchError(() => of(null))
    );
  }

  /** Rapports de l'équipe (Manager / Commercial Leader) */
  getTeamReports(managerId: number): Observable<DailyReportSummary[]> {
    return this.http.get<DailyReportSummary[]>(`${this.apiUrl}/team?managerId=${managerId}`).pipe(
      catchError(() => of([]))
    );
  }

  /** Tous les rapports du jour (Admin) */
  getAllReports(): Observable<DailyReportSummary[]> {
    return this.http.get<DailyReportSummary[]>(`${this.apiUrl}/all`).pipe(
      catchError(() => of([]))
    );
  }

  /** Nombre de rapports non soumis du jour (badge Admin) */
  getUnsubmittedCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/unsubmitted-count`).pipe(
      catchError(() => of(0))
    );
  }

  /** Récupérer un rapport complet par ID (pour Admin / Manager : voir détail) */
  getReportById(reportId: number): Observable<DailyReport> {
    return this.http.get<DailyReport>(`${this.apiUrl}/${reportId}`);
  }
}
