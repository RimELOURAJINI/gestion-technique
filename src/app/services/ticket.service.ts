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

  getTicketsByManager(userId: number): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.baseUrl}/manager/${userId}`);
  }

  getTicketsByCommercial(userId: number): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.baseUrl}/commercial/${userId}`);
  }

  getTicketsByEmployee(userId: number): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.baseUrl}/employee/${userId}`);
  }

  getUnansweredTicketsCountForUser(userId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/user/${userId}/unansweredCount`);
  }

  createTicket(userId: number, ticket: Ticket): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.baseUrl}/user/${userId}`, ticket);
  }

  updateTicketStatus(ticketId: number, status: string): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.baseUrl}/${ticketId}/status`, `"${status}"`);
  }

  validateTicket(ticketId: number, userId: number, solution: string, correctedBy: string): Observable<Ticket> {
    return this.http.patch<Ticket>(`${this.baseUrl}/${ticketId}/validate?userId=${userId}&solution=${encodeURIComponent(solution)}&correctedBy=${encodeURIComponent(correctedBy)}`, {});
  }

  // Client Specific
  getClientProjects(clientId: number): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:8080/api/projects/user/${clientId}`);
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
