import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TeamChatService {
  private apiUrl = 'http://localhost:8080/api/teams/chat';

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

  getUnreadCount(userId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/unread-count/${userId}`);
  }

  markAsRead(userId: number, senderId: number): Observable<any> {
    const payload = { userId, senderId };
    return this.http.post<any>(`${this.apiUrl}/mark-as-read`, payload);
  }
}
