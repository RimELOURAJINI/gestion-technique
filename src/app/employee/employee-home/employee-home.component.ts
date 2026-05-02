import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { EmployeeService } from '../../services/employee.service';
import { HrService } from '../../services/hr.service';
import { AuthService } from '../../services/auth.service';
import { Project, Task, SubTask } from '../../models/models';
import { AiService } from '../../services/ai.service';

declare var initDashboardCharts: any;
declare var ApexCharts: any;

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
    completedTasks: 0,
    productivityScore: 0
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
    private aiService: AiService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.isLoading = true;
      
      this.employeeService.getMyProjects(userId).subscribe(projects => {
        this.myProjects = projects;
        // Correction: Only projects with non-completed status are considered active in the dashboard stats
        this.stats.myProjects = projects.filter(p => {
          const s = (p.status || '').toUpperCase();
          return s !== 'COMPLETED' && s !== 'FINISHED' && s !== 'TERMINE' && s !== 'TERMINEE';
        }).length;
      });

      this.employeeService.getMyTasks(userId).subscribe(tasks => {
        const finishedStatuses = ['COMPLETED', 'DONE', 'TERMINE', 'TERMINEE'];
        this.stats.activeTasks = tasks.filter(t => !finishedStatuses.includes((t.status || '').toUpperCase())).length;
        this.stats.completedTasks = tasks.filter(t => finishedStatuses.includes((t.status || '').toUpperCase())).length;
        
        // Today's tasks (All uncompleted tasks)
        const todayStr = this.today.toDateString();
        let ctx = '';
        this.todayTasks = tasks.filter(t => {
          const isUncompleted = !finishedStatuses.includes((t.status || '').toUpperCase());
          if (isUncompleted) {
             ctx += `- ${t.title} (Priorité: ${t.priority}, Deadline: ${t.deadline ? new Date(t.deadline).toLocaleDateString() : 'Non fixée'})\n`;
          }
          return isUncompleted;
        });
        this.tasksContextStr = ctx ? ctx : 'Félicitations, vous n\'avez aucune tâche en cours !';

        // Upcoming (non-today, non-completed)
        this.upcomingTasks = tasks
          .filter(t => !finishedStatuses.includes((t.status || '').toUpperCase()) && t.deadline)
          .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
          .slice(0, 5);
          
        this.isLoading = false;
      });

      // Fetch real Attendance for today to ensure 'checkIn' property exists for the UI
      this.hrService.getTodayAttendance(userId).subscribe({
        next: (att) => {
          this.activeAttendance = att;
        },
        error: () => {
          this.activeAttendance = null;
        }
      });

      // Fetch Productivity Score separately
      this.http.get<any>(`http://localhost:8080/api/stats/user/${userId}/productivity`).subscribe({
        next: (data) => {
          this.stats.productivityScore = data.score;
        },
        error: () => { }
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
      this.renderProductivityChart();
    }, 800);
  }

  renderProductivityChart() {
    if (typeof ApexCharts === 'undefined') return;

    const chartId = "reservation-chart";
    const ctx = document.getElementById(chartId);
    if (!ctx) return;

    ctx.innerHTML = '';
    
    // We use the productivity score and some variations for the chart
    const score = this.stats.productivityScore || 75;
    const seriesData = [
      Math.max(0, score - 15), 
      Math.max(0, score - 5), 
      score, 
      Math.min(100, score + 5), 
      Math.min(100, score + 10), 
      score, 
      Math.min(100, score + 2)
    ];

    const options = {
      chart: {
        width: '100%',
        height: 250,
        type: 'bar',
        toolbar: { show: false },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          borderRadius: 4,
          endingShape: 'rounded'
        }
      },
      colors: ['#4361ee'],
      dataLabels: { enabled: false },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },
      series: [{
        name: 'Productivité (%)',
        data: seriesData
      }],
      xaxis: {
        categories: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        axisTicks: { show: false },
        axisBorder: { show: false }
      },
      yaxis: { 
        max: 100,
        labels: { formatter: (val: any) => val + '%' } 
      },
      tooltip: {
        y: {
          formatter: function (val: any) {
            return val + " %";
          }
        }
      }
    };

    new ApexCharts(ctx, options).render();
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
    const status = (s || '').toUpperCase();
    if (status === 'DONE' || status === 'COMPLETED' || status === 'TERMINE' || status === 'TERMINEE') return 'bg-success';
    if (status === 'IN_PROGRESS' || status === 'EN COURS') return 'bg-warning text-dark';
    return 'bg-secondary';
  }

  getStatusLabel(s: string): string {
    const status = (s || '').toUpperCase();
    if (status === 'DONE' || status === 'COMPLETED' || status === 'TERMINE' || status === 'TERMINEE') return 'Terminée';
    if (status === 'IN_PROGRESS' || status === 'EN COURS') return 'En cours';
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