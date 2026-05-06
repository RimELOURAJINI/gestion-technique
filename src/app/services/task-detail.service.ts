import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskNote, TaskStatusHistory } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class TaskDetailService {
  private baseUrl = 'http://localhost:8080/api/tasks';

  constructor(private http: HttpClient) { }

  getTaskById(taskId: number): Observable<Task> {
    return this.http.get<Task>(`${this.baseUrl}/${taskId}`);
  }

  getTaskNotes(taskId: number): Observable<TaskNote[]> {
    return this.http.get<TaskNote[]>(`${this.baseUrl}/${taskId}/notes`);
  }

  addNote(taskId: number, authorId: number, content: string): Observable<TaskNote> {
    return this.http.post<TaskNote>(`${this.baseUrl}/${taskId}/notes?authorId=${authorId}`, content);
  }

  getTaskHistory(taskId: number): Observable<TaskStatusHistory[]> {
    return this.http.get<TaskStatusHistory[]>(`${this.baseUrl}/${taskId}/history`);
  }

  updateStatus(taskId: number, status: string): Observable<Task> {
    return this.http.patch<Task>(`${this.baseUrl}/${taskId}/status`, JSON.stringify(status), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
