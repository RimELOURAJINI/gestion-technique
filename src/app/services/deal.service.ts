import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DealService {
  private apiUrl = 'http://localhost:8080/api/deals';

  constructor(private http: HttpClient) {}

  getAllDeals(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getDealById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  getDealsByClient(clientId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/client/${clientId}`);
  }

  getDealsByCommercial(commercialId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/commercial/${commercialId}`);
  }

  getUnassignedDeals(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/unassigned`);
  }

  assignCommercial(dealId: number, commercialId: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${dealId}/assign`, null, {
      params: { commercialId: commercialId.toString() }
    });
  }

  createDeal(deal: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, deal);
  }

  updateStatus(id: number, status: string, teamId?: number): Observable<any> {
    let url = `${this.apiUrl}/${id}/status?status=${status}`;
    if (teamId) {
      url += `&teamId=${teamId}`;
    }
    return this.http.put<any>(url, {});
  }

  ensureChat(id: number, userId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/chat?userId=${userId}`, {});
  }

  deleteDeal(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
