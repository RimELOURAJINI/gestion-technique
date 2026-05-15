import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskNote, TaskStatusHistory, ProjectNote } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class TaskDetailService {
  private baseUrl = 'http://54.37.245.19:4950/api/tasks';
  private projectUrl = 'http://54.37.245.19:4950/api/projects';

  constructor(private http: HttpClient) { }

  getTaskById(taskId: number): Observable<Task> {
    return this.http.get<Task>(`${this.baseUrl}/${taskId}`);
  }

  getTaskNotes(taskId: number): Observable<TaskNote[]> {
    return this.http.get<TaskNote[]>(`${this.baseUrl}/${taskId}/notes`);
  }

  addNote(taskId: number, authorId: number, content: string, parentNoteId?: number): Observable<TaskNote> {
    let url = `${this.baseUrl}/${taskId}/notes?authorId=${authorId}`;
    if (parentNoteId) url += `&parentNoteId=${parentNoteId}`;
    return this.http.post<TaskNote>(url, content);
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

  markTaskNotesAsRead(taskId: number, userId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${taskId}/notes/read?userId=${userId}`, {});
  }

  // =========== Project Notes ===========
  getProjectNotes(projectId: number): Observable<ProjectNote[]> {
    return this.http.get<ProjectNote[]>(`${this.projectUrl}/${projectId}/notes`);
  }

  getAllProjectRelatedNotes(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.projectUrl}/${projectId}/all-notes`);
  }

  addProjectNote(projectId: number, authorId: number, content: string, parentNoteId?: number): Observable<ProjectNote> {
    let url = `${this.projectUrl}/${projectId}/notes?authorId=${authorId}`;
    if (parentNoteId) url += `&parentNoteId=${parentNoteId}`;
    return this.http.post<ProjectNote>(url, content);
  }

  updateProjectNote(noteId: number, authorId: number, content: string): Observable<ProjectNote> {
    return this.http.put<ProjectNote>(`${this.projectUrl}/notes/${noteId}?authorId=${authorId}`, content);
  }

  deleteProjectNote(noteId: number, authorId: number): Observable<void> {
    return this.http.delete<void>(`${this.projectUrl}/notes/${noteId}?authorId=${authorId}`);
  }

  markProjectNotesAsRead(projectId: number, userId: number): Observable<void> {
    return this.http.post<void>(`${this.projectUrl}/${projectId}/notes/mark-as-read?userId=${userId}`, {});
  }
}
