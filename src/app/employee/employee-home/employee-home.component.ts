import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { Project, Task, SubTask } from '../../models/models';

declare var initDashboardCharts: any;

@Component({
  selector: 'app-employee-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './employee-home.component.html',
  styleUrl: './employee-home.component.css'
})
export class EmployeeHomeComponent implements OnInit, AfterViewInit {
  stats = {
    myProjects: 0,
    activeTasks: 0,
    completedTasks: 0
  };
  today: Date = new Date();
  upcomingTasks: Task[] = [];
  todayTasks: Task[] = [];
  myProjects: Project[] = [];
  isLoading = true;
  newTodoText = '';
  localTodos: { text: string; done: boolean }[] = JSON.parse(localStorage.getItem('employee_todos') || '[]');

  constructor(
    private employeeService: EmployeeService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.isLoading = true;
      
      this.employeeService.getMyProjects(userId).subscribe(projects => {
        this.myProjects = projects;
        this.stats.myProjects = projects.length;
      });

      this.employeeService.getMyTasks(userId).subscribe(tasks => {
        this.stats.activeTasks = tasks.filter(t => t.status !== 'COMPLETED' && t.status !== 'DONE').length;
        this.stats.completedTasks = tasks.filter(t => t.status === 'COMPLETED' || t.status === 'DONE').length;
        
        // Today's tasks
        const todayStr = this.today.toDateString();
        this.todayTasks = tasks.filter(t => {
          if (!t.deadline) return false;
          return new Date(t.deadline).toDateString() === todayStr;
        });

        // Upcoming (non-today, non-completed)
        this.upcomingTasks = tasks
          .filter(t => (t.status !== 'COMPLETED' && t.status !== 'DONE') && t.deadline)
          .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
          .slice(0, 5);
          
        this.isLoading = false;
      });
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (typeof initDashboardCharts === 'function') {
        initDashboardCharts();
      }
    }, 500);
  }

  addTodo(): void {
    if (this.newTodoText.trim()) {
      this.localTodos.push({ text: this.newTodoText.trim(), done: false });
      this.newTodoText = '';
      this.saveTodos();
    }
  }

  toggleTodo(i: number): void {
    this.localTodos[i].done = !this.localTodos[i].done;
    this.saveTodos();
  }

  removeTodo(i: number): void {
    this.localTodos.splice(i, 1);
    this.saveTodos();
  }

  private saveTodos(): void {
    localStorage.setItem('employee_todos', JSON.stringify(this.localTodos));
  }

  getStatusClass(s: string): string {
    if (s === 'DONE' || s === 'COMPLETED') return 'bg-success';
    if (s === 'IN_PROGRESS') return 'bg-warning text-dark';
    return 'bg-secondary';
  }

  getStatusLabel(s: string): string {
    if (s === 'DONE' || s === 'COMPLETED') return 'Terminée';
    if (s === 'IN_PROGRESS') return 'En cours';
    return 'À faire';
  }
}