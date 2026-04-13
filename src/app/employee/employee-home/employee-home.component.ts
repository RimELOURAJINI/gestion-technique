import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { HrService } from '../../services/hr.service';
import { AuthService } from '../../services/auth.service';
import { Project, Task, SubTask } from '../../models/models';
import { AiService } from '../../services/ai.service';

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

  isAiLoading = false;
  aiMessage = '';

  // Aide à la décision IA (Niveau d'énergie)
  currentMood: string = localStorage.getItem('employee_mood') || 'Normal';
  tasksContextStr: string = '';

  // Pointage (Presence)
  activeAttendance: any = null;
  isClockingIn = false;

  constructor(
    private employeeService: EmployeeService,
    private hrService: HrService,
    public authService: AuthService,
    private aiService: AiService
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
        let ctx = '';
        this.todayTasks = tasks.filter(t => {
          if (!t.deadline) return false;
          const isToday = new Date(t.deadline).toDateString() === todayStr;
          if (isToday) {
             ctx += `- ${t.title} (Complexité technique: ${t.storyPoints || 3}/8 points)\n`;
          }
          return isToday;
        });
        this.tasksContextStr = ctx ? ctx : 'Aucune tâche précise deadline aujourd\'hui.';

        // Upcoming (non-today, non-completed)
        this.upcomingTasks = tasks
          .filter(t => (t.status !== 'COMPLETED' && t.status !== 'DONE') && t.deadline)
          .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
          .slice(0, 5);
          
        this.isLoading = false;
      });

      // Load Today's Attendance
      this.hrService.getTodayAttendance(userId).subscribe(attendance => {
        this.activeAttendance = attendance;
      });
    }
  }

  onCheckIn(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;
    this.isClockingIn = true;
    console.log(`[ATTENDANCE] Checking in for user ${userId}`);
    this.hrService.checkIn(userId).subscribe({
      next: (res) => {
        console.log('[ATTENDANCE] Check-in success:', res);
        this.activeAttendance = res;
        this.isClockingIn = false;
      },
      error: (err) => {
        console.error('[ATTENDANCE] Check-in error:', err);
        this.isClockingIn = false;
        alert('Erreur lors du pointage. Verifiez votre connexion ou contactez l\'administrateur.');
      }
    });
  }

  onCheckOut(): void {
    const userId = this.authService.getUserId();
    if (!userId || !this.activeAttendance) return;
    this.isClockingIn = true;
    console.log(`[ATTENDANCE] Checking out for user ${userId}, session ${this.activeAttendance.id}`);
    this.hrService.checkOut(userId, this.activeAttendance.id).subscribe({
      next: (res) => {
        console.log('[ATTENDANCE] Check-out success:', res);
        this.activeAttendance = res;
        this.isClockingIn = false;
      },
      error: (err) => {
        console.error('[ATTENDANCE] Check-out error:', err);
        this.isClockingIn = false;
        alert('Erreur lors du départ. Réessayez plus tard.');
      }
    });
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

  setMood(mood: string) {
    this.currentMood = mood;
    localStorage.setItem('employee_mood', mood);
  }

  refreshAiStats() {
    const userId = this.authService.getUserId();
    if (!userId) return;
    
    console.log(`[AI-INSIGHTS] 🚀 Génération analyse - userId: ${userId} - mode: insights`);
    this.isAiLoading = true;
    this.aiMessage = '';
    
    this.aiService.getAIStatisticsStream(userId, '', 'insights').subscribe({
      next: (chunk) => {
        this.isAiLoading = false;
        this.aiMessage += chunk;
      },
      error: (err) => {
        this.isAiLoading = false;
        console.error('AI Error:', err);
        if(!this.aiMessage) this.aiMessage = "Erreur de connexion à l'Agent IA.";
      },
      complete: () => {
        this.isAiLoading = false;
      }
    });
  }
}