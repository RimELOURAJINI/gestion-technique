import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeamChatService {
  private apiUrl = 'http://localhost:8080/api/team-chat';

  constructor(private http: HttpClient) {}

  getGlobalMessages(teamId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/team/${teamId}`);
  }

  getPrivateMessages(teamId: number, uid1: number, uid2: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/private/${teamId}?uid1=${uid1}&uid2=${uid2}`);
  }

  sendMessage(payload: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/send`, payload);
  }
}
