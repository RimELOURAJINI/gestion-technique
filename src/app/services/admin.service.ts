import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Project, Task, Team, User, Reclamation } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  // ========== PROJECTS ==========
  getAllProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.baseUrl}/projects/all`);
  }

  getProjectById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.baseUrl}/projects/${id}`);
  }

  createProject(project: any): Observable<any> {
    console.log("🚀 AdminService: Posting Project", project);
    return this.http.post(`${this.baseUrl}/projects/create`, project).pipe(
      tap(res => console.log("✅ Project created:", res)),
      catchError(err => {
        console.error("❌ Error creating project:", err);
        return throwError(() => err);
      })
    );
  }

  updateProject(projectId: number, project: any): Observable<Project> {
    return this.http.put<Project>(`${this.baseUrl}/projects/${projectId}`, project);
  }

  deleteProject(projectId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/projects/${projectId}`);
  }

  assignProjectToTeam(projectId: number, teamId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/projects/${projectId}/assign/${teamId}`, {});
  }

  assignProjectToManager(projectId: number, userId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/projects/${projectId}/assign-manager/${userId}`, {});
  }

  getProjectIdsWithTickets(): Observable<number[]> {
    return this.http.get<number[]>(`${this.baseUrl}/projects/with-tickets`);
  }

  // ========== TASKS ==========
  getAllTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.baseUrl}/tasks/all`);
  }

  createTask(task: any): Observable<any> {
    console.log("🚀 AdminService: Posting Task", task);
    return this.http.post(`${this.baseUrl}/tasks/create`, task).pipe(
      tap(res => console.log("✅ Task created:", res)),
      catchError(err => {
        console.error("❌ Error creating task:", err);
        return throwError(() => err);
      })
    );
  }

  assignTaskToUser(userId: number, task: Task): Observable<Task> {
    return this.http.post<Task>(`${this.baseUrl}/tasks/user/${userId}`, task);
  }

  deleteTask(taskId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/tasks/${taskId}`);
  }

  updateTask(taskId: number, task: any): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}/tasks/${taskId}`, task);
  }

  // ========== TEAMS ==========
  getAllTeams(): Observable<Team[]> {
    return this.http.get<Team[]>(`${this.baseUrl}/teams/all`);
  }

  createTeam(team: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/teams/create`, team);
  }

  updateTeam(id: number, team: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/teams/update/${id}`, team);
  }

  assignUserToTeam(teamId: number, userId: number): Observable<Team> {
    return this.http.post<Team>(`${this.baseUrl}/teams/${teamId}/assign-user/${userId}`, {});
  }

  assignManagerToTeam(teamId: number, userId: number): Observable<Team> {
    return this.http.post<Team>(`${this.baseUrl}/teams/${teamId}/assign-manager/${userId}`, {});
  }

  removeUserFromTeam(teamId: number, userId: number): Observable<Team> {
    return this.http.delete<Team>(`${this.baseUrl}/teams/${teamId}/remove-user/${userId}`);
  }

  // ========== USERS ==========
  getUsersByRole(role: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users/role/${role}`);
  }

  getAllUsers(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/users/all`);
  }

  updateUserRoles(userId: number, roleIds: number[]): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/${userId}/roles`, roleIds);
  }

  getAllRoles(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/roles/all`);
  }

  // ========== RECLAMATIONS ==========
  getReclamations(): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(`${this.baseUrl}/reclamations/all`);
  }

  updateReclamationStatus(id: number, status: string, response: string = ''): Observable<Reclamation> {
    return this.http.patch<Reclamation>(`${this.baseUrl}/reclamations/${id}/status?status=${status}&response=${response}`, {});
  }

  // ========== TICKETS & MESSAGES (Commercial Chat) ==========
  getTicketMessages(ticketId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/tickets/${ticketId}/messages`);
  }

  addTicketMessage(ticketId: number, userId: number, content: string, images: string[]): Observable<any> {
    const payload = { content, images };
    return this.http.post<any>(`${this.baseUrl}/tickets/${ticketId}/messages/user/${userId}`, payload);
  }

  createTicket(userId: number, payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/tickets/user/${userId}`, payload);
  }

  getAllTickets(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/tickets`);
  }
}
