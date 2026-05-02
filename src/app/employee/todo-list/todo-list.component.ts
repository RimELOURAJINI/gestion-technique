import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { Task, SubTask } from '../../models/models';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css']
})
export class TodoListComponent implements OnInit {
  todayTasks: Task[] = [];
  personalTasks: Task[] = [];
  loading = true;
  
  // For adding personal task
  newTaskTitle = '';
  
  // Search
  searchTerm = '';
  
  // For managing subtasks of a selected task
  selectedTask: Task | null = null;
  newSubtaskTitle = '';

  constructor(
    private employeeService: EmployeeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
    
    // Subscribe to global search
    this.employeeService.searchQuery$.subscribe(term => {
      this.searchTerm = term;
    });
  }

  loadData(): void {
    this.loading = true;
    const userId = this.authService.getUserId();
    if (userId) {
      this.employeeService.getMyTasks(userId).subscribe({
        next: (tasks) => {
          const today = new Date().toDateString();
          
          // 1. Filter: show uncompleted tasks OR those completed today
          const filtered = tasks.filter(t => {
            const isDone = t.status === 'DONE' || t.status === 'COMPLETED';
            if (!isDone) return true;
            if (t.actualEndTime) {
              return new Date(t.actualEndTime).toDateString() === today;
            }
            // Fallback for just completed tasks without actualEndTime yet (though updateTaskStatus sets it)
            return true; 
          });

          // 2. Sort: Uncompleted first, then by priority (HIGH > MEDIUM > LOW), then completed at bottom
          const priorityWeight: any = { 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3 };
          
          const sorted = filtered.sort((a, b) => {
            const aDone = a.status === 'DONE' || a.status === 'COMPLETED' ? 1 : 0;
            const bDone = b.status === 'DONE' || b.status === 'COMPLETED' ? 1 : 0;
            
            if (aDone !== bDone) return aDone - bDone;
            
            const aPrio = priorityWeight[a.priority || 'MEDIUM'] || 2;
            const bPrio = priorityWeight[b.priority || 'MEDIUM'] || 2;
            
            return aPrio - bPrio;
          });

          this.todayTasks = sorted.filter(t => t.project != null);
          this.personalTasks = sorted.filter(t => t.project == null);
          
          // For each task, load subtasks
          tasks.forEach(t => {
            if (t.id) {
              this.employeeService.getSubtasks(t.id).subscribe(subs => t.subtasks = subs);
            }
          });
          
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading tasks', err);
          this.loading = false;
        }
      });
    }
  }

  // --- Task CRUD ---
  addPersonalTask(): void {
    if (!this.newTaskTitle.trim()) return;
    const userId = this.authService.getUserId();
    if (!userId) return;

    const task: Task = {
      title: this.newTaskTitle,
      status: 'TODO',
      priority: 'MEDIUM',
      description: 'Tâche personnelle'
    };

    this.employeeService.createTask(userId, task).subscribe(() => {
      this.newTaskTitle = '';
      this.loadData();
    });
  }

  deleteTask(taskId: number): void {
    if (confirm('Supprimer cette tâche ?')) {
      this.employeeService.deleteTask(taskId).subscribe(() => this.loadData());
    }
  }

  toggleTaskStatus(task: Task): void {
    const newStatus = (task.status === 'DONE' || task.status === 'COMPLETED') ? 'TODO' : 'DONE';
    if (task.id) {
      this.employeeService.updateTaskStatus(task.id, newStatus).subscribe(() => {
        task.status = newStatus;
        this.employeeService.triggerRefresh();
      });
    }
  }

  // --- Subtask CRUD ---
  selectTask(task: Task): void {
    this.selectedTask = task;
  }

  addSubtask(): void {
    if (!this.selectedTask || !this.selectedTask.id || !this.newSubtaskTitle.trim()) return;

    const sub: SubTask = {
      title: this.newSubtaskTitle.trim(),
      done: false
    };

    this.employeeService.createSubtask(this.selectedTask.id, sub).subscribe(created => {
      if (!this.selectedTask!.subtasks) this.selectedTask!.subtasks = [];
      this.selectedTask!.subtasks.push(created);
      this.newSubtaskTitle = '';
    });
  }

  toggleSubtask(sub: SubTask): void {
    if (!sub.id) return;
    this.employeeService.toggleSubtask(sub.id).subscribe(updated => {
      sub.done = updated.done;
      this.employeeService.triggerRefresh();
    });
  }

  deleteSubtask(task: Task, subId: number): void {
    this.employeeService.deleteSubtask(subId).subscribe(() => {
      task.subtasks = task.subtasks?.filter(s => s.id !== subId);
    });
  }

  getStatusClass(s: string | undefined): string {
    if (!s) return 'bg-secondary';
    const status = s.toUpperCase();
    if (status === 'DONE' || status === 'COMPLETED') return 'bg-success';
    if (status === 'IN_PROGRESS' || status === 'DOING') return 'bg-warning text-dark';
    if (status === 'TEST' || status === 'REVIEW') return 'bg-info';
    return 'bg-secondary';
  }

  getStatusLabel(s: string | undefined): string {
    if (!s) return 'À faire';
    const status = s.toUpperCase();
    if (status === 'DONE' || status === 'COMPLETED') return 'Terminée';
    if (status === 'IN_PROGRESS' || status === 'DOING') return 'En cours';
    if (status === 'TEST' || status === 'REVIEW') return 'En Test';
    return 'À faire';
  }

  getTaskProgress(task: Task): number {
    if (!task.subtasks || task.subtasks.length === 0) return task.status === 'DONE' ? 100 : 0;
    const done = task.subtasks.filter(s => s.done).length;
    return Math.round((done / task.subtasks.length) * 100);
  }

  // --- Search Filtering ---
  get filteredTodayTasks(): Task[] {
    if (!this.searchTerm.trim()) return this.todayTasks;
    const term = this.searchTerm.toLowerCase();
    return this.todayTasks.filter(t => 
      t.title.toLowerCase().includes(term) || 
      (t.project && t.project.name.toLowerCase().includes(term)) ||
      (t.subtasks && t.subtasks.some(s => s.title.toLowerCase().includes(term)))
    );
  }

  get filteredPersonalTasks(): Task[] {
    if (!this.searchTerm.trim()) return this.personalTasks;
    const term = this.searchTerm.toLowerCase();
    return this.personalTasks.filter(t => 
      t.title.toLowerCase().includes(term) ||
      (t.subtasks && t.subtasks.some(s => s.title.toLowerCase().includes(term)))
    );
  }
}
