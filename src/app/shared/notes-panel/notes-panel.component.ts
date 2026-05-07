import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskDetailService } from '../../services/task-detail.service';
import { AuthService } from '../../services/auth.service';
import { TaskNote, ProjectNote, User } from '../../models/models';

@Component({
  selector: 'app-notes-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notes-panel.component.html',
  styleUrl: './notes-panel.component.css'
})
export class NotesPanelComponent implements OnInit, OnChanges {
  /** 'task' or 'project' */
  @Input() mode: 'task' | 'project' = 'task';
  /** ID of the task or project */
  @Input() entityId!: number;
  /** Emitted when user closes the panel */
  @Output() close = new EventEmitter<void>();

  taskNotes: TaskNote[] = [];
  projectNotes: ProjectNote[] = [];
  isLoading = false;
  newContent = '';
  editingNoteId: number | null = null;
  editContent = '';
  currentUser: User | null = null;

  constructor(
    private noteService: TaskDetailService,
    private authService: AuthService
  ) {}

  get notes(): (TaskNote | ProjectNote)[] {
    return this.mode === 'task' ? this.taskNotes : this.projectNotes;
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue as any;
    this.loadNotes();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['entityId'] && !changes['entityId'].firstChange) {
      this.loadNotes();
    }
  }

  loadNotes(): void {
    if (!this.entityId) return;
    this.isLoading = true;
    if (this.mode === 'task') {
      this.noteService.getTaskNotes(this.entityId).subscribe({
        next: (data: TaskNote[]) => { this.taskNotes = data; this.isLoading = false; },
        error: () => { this.isLoading = false; }
      });
    } else {
      this.noteService.getProjectNotes(this.entityId).subscribe({
        next: (data: ProjectNote[]) => { this.projectNotes = data; this.isLoading = false; },
        error: () => { this.isLoading = false; }
      });
    }
  }

  addNote(): void {
    const userId = this.authService.getUserId();
    if (!this.newContent.trim() || !userId) return;
    const content = this.newContent.trim();
    if (this.mode === 'task') {
      this.noteService.addNote(this.entityId, userId, content).subscribe({
        next: (note: TaskNote) => {
          this.taskNotes.unshift(note);
          this.newContent = '';
        }
      });
    } else {
      this.noteService.addProjectNote(this.entityId, userId, content).subscribe({
        next: (note: ProjectNote) => {
          this.projectNotes.unshift(note);
          this.newContent = '';
        }
      });
    }
  }

  startEdit(note: TaskNote | ProjectNote): void {
    this.editingNoteId = note.id || null;
    this.editContent = note.content;
  }

  cancelEdit(): void {
    this.editingNoteId = null;
    this.editContent = '';
  }

  saveEdit(): void {
    const userId = this.authService.getUserId();
    if (!this.editContent.trim() || !this.editingNoteId || !userId) return;
    const content = this.editContent.trim();
    if (this.mode === 'task') {
      this.noteService.updateNote(this.editingNoteId, userId, content).subscribe({
        next: (updated: TaskNote) => {
          const idx = this.taskNotes.findIndex(n => n.id === this.editingNoteId);
          if (idx !== -1) this.taskNotes[idx] = updated;
          this.editingNoteId = null;
        }
      });
    } else {
      this.noteService.updateProjectNote(this.editingNoteId, userId, content).subscribe({
        next: (updated: ProjectNote) => {
          const idx = this.projectNotes.findIndex(n => n.id === this.editingNoteId);
          if (idx !== -1) this.projectNotes[idx] = updated;
          this.editingNoteId = null;
        }
      });
    }
  }

  deleteNote(note: TaskNote | ProjectNote): void {
    const userId = this.authService.getUserId();
    if (!note.id || !userId) return;
    if (!confirm('Supprimer cette note ?')) return;
    if (this.mode === 'task') {
      this.noteService.deleteNote(note.id, userId).subscribe({
        next: () => { this.taskNotes = this.taskNotes.filter(n => n.id !== note.id); }
      });
    } else {
      this.noteService.deleteProjectNote(note.id, userId).subscribe({
        next: () => { this.projectNotes = this.projectNotes.filter(n => n.id !== note.id); }
      });
    }
  }

  getAuthorInitials(note: TaskNote | ProjectNote): string {
    const author = (note as any).author;
    if (!author) return '?';
    return `${(author.firstName || '')[0] || ''}${(author.lastName || '')[0] || ''}`.toUpperCase();
  }

  getAuthorName(note: TaskNote | ProjectNote): string {
    const author = (note as any).author;
    if (!author) return 'Inconnu';
    return `${author.firstName} ${author.lastName}`;
  }

  isEditing(note: TaskNote | ProjectNote): boolean {
    return this.editingNoteId === note.id;
  }
}
