import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, BehaviorSubject } from 'rxjs';
import { Project, Task, Reclamation, Ticket, SubTask } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private baseUrl = 'http://localhost:8080/api';
  private searchQuery = new BehaviorSubject<string>('');
  searchQuery$ = this.searchQuery.asObservable();

  private refreshTrigger = new BehaviorSubject<void>(undefined);
  refreshTrigger$ = this.refreshTrigger.asObservable();

  constructor(private http: HttpClient) { }

  triggerRefresh() {
    this.refreshTrigger.next();
  }

  setSearchQuery(query: string) {
    this.searchQuery.next(query);
  }

  // Projects
  // Projects derived from assigned tasks
  getMyProjects(userId: number): Observable<Project[]> {
    return this.getMyTasks(userId).pipe(
      map(tasks => {
        const projectsMap = new Map<number, Project>();
        tasks.forEach(t => {
          if (t.project && t.project.id) {
            projectsMap.set(t.project.id, t.project);
          }
        });
        return Array.from(projectsMap.values());
      })
    );
  }

  // Tasks
  getMyTasks(userId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.baseUrl}/tasks/user/${userId}`);
  }

  searchTasks(userId: number, query: string): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.baseUrl}/tasks/user/${userId}/search?q=${query}`);
  }

  getTaskById(taskId: number): Observable<Task> {
    return this.http.get<Task>(`${this.baseUrl}/tasks/${taskId}`);
  }

  getProjectById(projectId: number): Observable<Project> {
    return this.http.get<Project>(`${this.baseUrl}/projects/${projectId}`);
  }

  getTasksByProject(projectId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.baseUrl}/tasks/project/${projectId}`);
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

  updateTaskStatus(taskId: number, status: string): Observable<Task> {
    // Backend expects PATCH with @RequestBody
    return this.http.patch<Task>(`${this.baseUrl}/tasks/${taskId}/status`, JSON.stringify(status), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  createTask(userId: number, task: Task): Observable<Task> {
    return this.http.post<Task>(`${this.baseUrl}/tasks/user/${userId}`, task);
  }

  updateTask(taskId: number, task: Task): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}/tasks/${taskId}`, task);
  }

  deleteTask(taskId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/tasks/${taskId}`);
  }

  // Reclamations
  getMyReclamations(userId: number): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(`${this.baseUrl}/reclamations/sender/${userId}`);
  }

  getReclamationsByTask(taskId: number): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(`${this.baseUrl}/reclamations/task/${taskId}`);
  }

  createReclamation(reclamation: Reclamation, userId: number, projectId: number): Observable<Reclamation> {
    return this.http.post<Reclamation>(`${this.baseUrl}/reclamations/user/${userId}/project/${projectId}`, reclamation);
  }

  // === SubTasks (backend persisted) ===
  getSubtasks(taskId: number): Observable<SubTask[]> {
    return this.http.get<SubTask[]>(`${this.baseUrl}/subtasks/task/${taskId}`);
  }

  createSubtask(taskId: number, subtask: SubTask): Observable<SubTask> {
    return this.http.post<SubTask>(`${this.baseUrl}/subtasks/task/${taskId}`, subtask);
  }

  toggleSubtask(subtaskId: number): Observable<SubTask> {
    return this.http.patch<SubTask>(`${this.baseUrl}/subtasks/${subtaskId}/toggle`, {});
  }

  deleteSubtask(subtaskId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/subtasks/${subtaskId}`);
  }

  // === Calendar Notes ===
  getCalendarNotes(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/calendar-notes/user/${userId}`);
  }

  saveCalendarNote(note: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/calendar-notes`, note);
  }

  getTodoCount(userId: number): Observable<{count: number}> {
    return this.http.get<{count: number}>(`${this.baseUrl}/tasks/user/${userId}/todo-count`);
  }
}

