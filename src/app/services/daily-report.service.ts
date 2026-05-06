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

  /** Récupérer mon rapport d'un jour spécifique (ou aujourd'hui) */
  getMyReport(userId: number, date?: string): Observable<DailyReport | null> {
    let url = `${this.apiUrl}/my?userId=${userId}`;
    if (date) url += `&date=${date}`;
    return this.http.get<DailyReport>(url).pipe(
      catchError(() => of(null))
    );
  }

  /** Rapports de l'équipe (Manager / Commercial Leader) par date */
  getTeamReports(managerId: number, date?: string): Observable<DailyReportSummary[]> {
    let url = `${this.apiUrl}/team?managerId=${managerId}`;
    if (date) url += `&date=${date}`;
    return this.http.get<DailyReportSummary[]>(url).pipe(
      catchError(() => of([]))
    );
  }

  /** Tous les rapports d'un jour spécifique (Admin) */
  getAllReports(date?: string): Observable<DailyReportSummary[]> {
    let url = `${this.apiUrl}/all`;
    if (date) url = `${this.apiUrl}/all?date=${date}`;
    return this.http.get<DailyReportSummary[]>(url).pipe(
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
