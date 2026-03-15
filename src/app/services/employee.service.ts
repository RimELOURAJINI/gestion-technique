import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project, Task, Reclamation, Ticket } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  // Projects
  getMyProjects(userId: number): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.baseUrl}/projects/user/${userId}`);
  }

  // Tasks
  getMyTasks(userId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.baseUrl}/tasks/user/${userId}`);
  }

  startTask(taskId: number): Observable<Task> {
    return this.http.post<Task>(`${this.baseUrl}/tasks/${taskId}/start`, {});
  }

  endTask(taskId: number): Observable<Task> {
    return this.http.post<Task>(`${this.baseUrl}/tasks/${taskId}/end`, {});
  }

  // Tickets / Reclamations
  sendBlockingTicket(userId: number, taskId: number, reclamation: Reclamation): Observable<Reclamation> {
    return this.http.post<Reclamation>(`${this.baseUrl}/reclamations/blocking-ticket/user/${userId}/task/${taskId}`, reclamation);
  }

  updateTaskDates(taskId: number, actualStartTime: number | null, actualEndTime: number | null): Observable<any> {
    return this.http.put(`${this.baseUrl}/tasks/${taskId}/dates`, { actualStartTime, actualEndTime });
  }

  // Tickets
  getMyTickets(userId: number): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.baseUrl}/tickets/user/${userId}`);
  }

  createTicket(ticket: Ticket, userId: number): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.baseUrl}/tickets/user/${userId}`, ticket);
  }
}
