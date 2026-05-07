import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskNote, TaskStatusHistory, ProjectNote } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class TaskDetailService {
  private baseUrl = 'http://localhost:8080/api/tasks';
  private projectUrl = 'http://localhost:8080/api/projects';

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

  updateNote(noteId: number, authorId: number, content: string): Observable<TaskNote> {
    return this.http.put<TaskNote>(`${this.baseUrl}/notes/${noteId}?authorId=${authorId}`, content);
  }

  deleteNote(noteId: number, authorId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/notes/${noteId}?authorId=${authorId}`);
  }

  getTaskHistory(taskId: number): Observable<TaskStatusHistory[]> {
    return this.http.get<TaskStatusHistory[]>(`${this.baseUrl}/${taskId}/history`);
  }

  updateStatus(taskId: number, status: string): Observable<Task> {
    return this.http.patch<Task>(`${this.baseUrl}/${taskId}/status`, JSON.stringify(status), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // =========== Project Notes ===========
  getProjectNotes(projectId: number): Observable<ProjectNote[]> {
    return this.http.get<ProjectNote[]>(`${this.projectUrl}/${projectId}/notes`);
  }

  addProjectNote(projectId: number, authorId: number, content: string): Observable<ProjectNote> {
    return this.http.post<ProjectNote>(`${this.projectUrl}/${projectId}/notes?authorId=${authorId}`, content);
  }

  updateProjectNote(noteId: number, authorId: number, content: string): Observable<ProjectNote> {
    return this.http.put<ProjectNote>(`${this.projectUrl}/notes/${noteId}?authorId=${authorId}`, content);
  }

  deleteProjectNote(noteId: number, authorId: number): Observable<void> {
    return this.http.delete<void>(`${this.projectUrl}/notes/${noteId}?authorId=${authorId}`);
  }
}
