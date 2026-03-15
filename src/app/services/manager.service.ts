import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project, Task, Ticket, Reclamation, User } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ManagerService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  // Projects
  getProjectsByUserId(userId: number): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.baseUrl}/projects/user/${userId}`);
  }

  getProjectById(projectId: number): Observable<Project> {
    return this.http.get<Project>(`${this.baseUrl}/projects/${projectId}`);
  }

  // Tasks
  getTasksByProjectId(projectId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.baseUrl}/tasks/project/${projectId}`);
  }

  addTaskToUser(userId: number, task: Task): Observable<any> {
    return this.http.post(`${this.baseUrl}/tasks/user/${userId}`, task);
  }

  updateTask(taskId: number, task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}/tasks/${taskId}`, task);
  }

  updateTaskStatus(taskId: number, status: string): Observable<Task> {
    return this.http.patch<Task>(`${this.baseUrl}/tasks/${taskId}/status`, status);
  }

  deleteTask(taskId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/tasks/${taskId}`);
  }

  // Tickets
  getTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.baseUrl}/tickets/all`);
  }

  getTicketsByUserId(userId: number): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.baseUrl}/tickets/user/${userId}`);
  }

  createTicket(userId: number, ticket: Ticket): Observable<Ticket> {
    return this.http.post<Ticket>(`${this.baseUrl}/tickets/user/${userId}`, ticket);
  }

  // Reclamations
  sendReclamation(userId: number, projectId: number, reclamation: Reclamation): Observable<Reclamation> {
    return this.http.post<Reclamation>(`${this.baseUrl}/reclamations/user/${userId}/project/${projectId}`, reclamation);
  }

  getReclamations(): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(`${this.baseUrl}/reclamations/all`);
  }

  updateReclamationStatus(id: number, status: string): Observable<Reclamation> {
    return this.http.patch<Reclamation>(`${this.baseUrl}/reclamations/${id}/status`, status);
  }

  getReclamationsByProjectId(projectId: number): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(`${this.baseUrl}/reclamations/project/${projectId}`);
  }

  getEmployees(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users/role/ROLE_Employee`);
  }

  getTasksByUserId(userId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.baseUrl}/tasks/user/${userId}`);
  }
}


