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
  replyingToId: number | null = null;

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
    this.markAsRead();
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
        next: (data: TaskNote[]) => { 
            // Build tree from flat list
            const roots = data.filter(n => !n.parentNote);
            roots.forEach(root => {
                root.replies = data.filter(child => child.parentNote && child.parentNote.id === root.id);
            });
            this.taskNotes = roots; 
            this.isLoading = false; 
        },
        error: () => { this.isLoading = false; }
      });
    } else {
      this.noteService.getProjectNotes(this.entityId).subscribe({
        next: (data: ProjectNote[]) => { 
            const roots = data.filter(n => !n.parentNote);
            roots.forEach(root => {
                root.replies = data.filter(child => child.parentNote && child.parentNote.id === root.id);
            });
            this.projectNotes = roots; 
            this.isLoading = false; 
        },
        error: () => { this.isLoading = false; }
      });
    }
  }

  markAsRead(): void {
    const userId = this.authService.getUserId();
    if (!this.entityId || !userId) return;
    if (this.mode === 'task') {
      this.noteService.markTaskNotesAsRead(this.entityId, userId).subscribe();
    } else {
      this.noteService.markProjectNotesAsRead(this.entityId, userId).subscribe();
    }
  }

  addNote(): void {
    const userId = this.authService.getUserId();
    if (!this.newContent.trim() || !userId) return;
    const content = this.newContent.trim();
    if (this.mode === 'task') {
      this.noteService.addNote(this.entityId, userId, content, this.replyingToId || undefined).subscribe({
        next: (note: TaskNote) => {
          if (this.replyingToId) {
            this.loadNotes(); // Refresh to show nested reply
          } else {
            this.taskNotes.unshift(note);
          }
          this.newContent = '';
          this.replyingToId = null;
        }
      });
    } else {
      this.noteService.addProjectNote(this.entityId, userId, content, this.replyingToId || undefined).subscribe({
        next: (note: ProjectNote) => {
          if (this.replyingToId) {
            this.loadNotes();
          } else {
            this.projectNotes.unshift(note);
          }
          this.newContent = '';
          this.replyingToId = null;
        }
      });
    }
  }

  startReply(note: TaskNote | ProjectNote): void {
    this.replyingToId = note.id || null;
    this.newContent = `@${this.getAuthorName(note)} `;
    // Focus the textarea
    setTimeout(() => {
        const textarea = document.querySelector('.notes-form textarea') as HTMLTextAreaElement;
        if (textarea) textarea.focus();
    }, 100);
  }

  cancelReply(): void {
    this.replyingToId = null;
    this.newContent = '';
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
        next: () => {
          this.loadNotes();
          this.editingNoteId = null;
        }
      });
    } else {
      this.noteService.updateProjectNote(this.editingNoteId, userId, content).subscribe({
        next: () => {
          this.loadNotes();
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
        next: () => { this.loadNotes(); }
      });
    } else {
      this.noteService.deleteProjectNote(note.id, userId).subscribe({
        next: () => { this.loadNotes(); }
      });
    }
  }

  getAuthorInitials(note: TaskNote | ProjectNote): string {
    const author = note.author;
    if (!author) return '?';
    return `${(author.firstName || '')[0] || ''}${(author.lastName || '')[0] || ''}`.toUpperCase();
  }

  getAuthorName(note: TaskNote | ProjectNote): string {
    const author = note.author;
    if (!author) return 'Inconnu';
    return `${author.firstName} ${author.lastName}`;
  }

  isEditing(note: TaskNote | ProjectNote): boolean {
    return this.editingNoteId === note.id;
  }

  canModify(note: TaskNote | ProjectNote): boolean {
    if (!this.currentUser || !note.author) return false;
    return this.currentUser.id === note.author.id;
  }
}
