import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
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

  constructor(
    private employeeService: EmployeeService,
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

  setMood(mood: string) {
    this.currentMood = mood;
    localStorage.setItem('employee_mood', mood);
  }

  refreshAiStats() {
    const userId = this.authService.getUserId();
    if (!userId) return;
    
    this.isAiLoading = true;
    this.aiMessage = '';
    
    const userName = this.authService.getUserName() || 'Collaborateur';
    
    // Injection discrète de l'état d'énergie et de la liste réelle des tâches
    const extraContext = `\n[Données Avancées Frontend: Humeur/Énergie du jour= ${this.currentMood} | Liste des tâches pressantes avec 'Story Points' (Complexité sur 8)= \n${this.tasksContextStr}]\n`;
    const prompt = `En tant qu'Assistant Décisionnel IA (Coach), personnalise ton conseil pour moi (Employé: ${userName}). Prends en compte mon niveau d'énergie actuel pour me suggérer exactement quelle tâche cibler en premier (parmi celles de la liste) pour optimiser ma vélocité globale sans me décourager. Ne donne que 3 recommandations directes.${extraContext}`;

    this.aiService.getAIStatisticsStream(userId, prompt).subscribe({
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