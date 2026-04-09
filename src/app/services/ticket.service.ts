import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ticket } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private baseUrl = 'http://localhost:8080/api/tickets';
  private clientUrl = 'http://localhost:8080/api/client';

  constructor(private http: HttpClient) { }

  // General Tickets
  getAllTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(this.baseUrl);
  }

  getTicketById(id: number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.baseUrl}/${id}`);
  }

  getTicketsByUserId(userId: number): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.baseUrl}/user/${userId}`);
  }

  createTicket(userId: number, ticket: Ticket): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.baseUrl}/user/${userId}`, ticket);
  }

  updateTicketStatus(ticketId: number, status: string): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.baseUrl}/${ticketId}/status`, `"${status}"`);
  }

  // Client Specific
  getClientProjects(clientId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.clientUrl}/${clientId}/projects`);
  }

  getClientTickets(clientId: number): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.clientUrl}/${clientId}/tickets`);
  }

  validateTicketResolution(ticketId: number, status: string): Observable<any> {
    return this.http.put(`${this.clientUrl}/tickets/${ticketId}/validate`, { status });
  }

  // Chat/Messages
  getMessages(ticketId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${ticketId}/messages`);
  }

  addMessage(ticketId: number, userId: number, content: string, images: string[] = []): Observable<any> {
    return this.http.post(`${this.baseUrl}/${ticketId}/messages/user/${userId}`, { content, images });
  }

  getParticipants(ticketId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${ticketId}/participants`);
  }
}
