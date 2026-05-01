import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { NotificationService, NotificationDTO } from '../../services/notification.service';
import { AiChatbotComponent } from '../../shared/ai-chatbot/ai-chatbot.component';
import { interval, Subscription } from 'rxjs';
import { TeamChatService } from '../../services/team-chat.service';
import { DailyReportService } from '../../services/daily-report.service';
import { PrimeService } from '../../services/prime.service';
import { TicketService } from '../../services/ticket.service';
import { EmployeeService } from '../../services/employee.service';


@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, AiChatbotComponent],
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.css']
})
export class EmployeeDashboardComponent implements OnInit {
  employeeName: string = '';
  employeeRole: string = '';
  employeeInitials: string = '';
  notifications: NotificationDTO[] = [];
  unreadCount: number = 0;
  unreadChatCount: number = 0;
  reportSubmitted: boolean = true;
  newPrimesCount: number = 0;
  activeTicketsCount: number = 0;
  todayTasks: any[] = [];
  todoCount: number = 0;
  tasksMenuOpen: boolean = false;
  dashboardMenuOpen: boolean = false;
  private notificationSub?: Subscription;
  private chatCountSub?: Subscription;


  constructor(
    public router: Router,
    public authService: AuthService,
    private notificationService: NotificationService,
    private teamChatService: TeamChatService,
    private dailyReportService: DailyReportService,
    private primeService: PrimeService,
    private ticketService: TicketService,
    private employeeService: EmployeeService
  ) {}

  onSearch(event: any): void {
    const query = event.target.value;
    this.employeeService.setSearchQuery(query);
  }


  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    this.employeeName = `${firstName} ${lastName}`.trim() || 'Employé';
    this.employeeRole = user.roles ? user.roles[0] : 'Employé';
    const parts = this.employeeName.split(' ');
    this.employeeInitials = parts.map((p: string) => p[0]).join('').toUpperCase().substring(0, 2);

    this.loadNotifications();
    this.loadUnreadChatCount();
    this.loadReportStatus();
    this.loadPrimes();
    this.loadActiveTicketsCount();
    this.loadTodayTasks();
    
    // Listen for refreshes from other components
    this.employeeService.refreshTrigger$.subscribe(() => {
      this.loadTodayTasks();
    });

    // Poll every 30 seconds
    this.notificationSub = interval(30000).subscribe(() => {
      this.loadNotifications();
      this.loadUnreadChatCount();
      this.loadPrimes();
      this.loadActiveTicketsCount();
      this.loadTodayTasks();
    });

    // Auto-open menu if on tasks page
    if (this.router.url.includes('/employee/tasks')) {
      this.tasksMenuOpen = true;
    }
    // Auto-open menu if on dashboard pages
    if (this.router.url.includes('/employee/home') || this.router.url.includes('/employee/performance')) {
      this.dashboardMenuOpen = true;
    }
  }

  ngOnDestroy(): void {
    if (this.notificationSub) this.notificationSub.unsubscribe();
    if (this.chatCountSub) this.chatCountSub.unsubscribe();
  }

  loadNotifications(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.notificationService.getUnreadNotifications(userId).subscribe(
        data => {
          this.notifications = data;
          this.unreadCount = data.length;
        },
        err => console.error('Error loading notifications', err)
      );
    }
  }

  markAsRead(notifId: number): void {
    this.notificationService.markAsRead(notifId).subscribe(() => {
      this.loadNotifications();
    });
  }

  markAllAsRead(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.notificationService.markAllAsRead(userId).subscribe(() => {
        this.loadNotifications();
      });
    }
  }

  toggleTasksMenu(): void {
    this.tasksMenuOpen = !this.tasksMenuOpen;
  }

  toggleDashboardMenu(): void {
    this.dashboardMenuOpen = !this.dashboardMenuOpen;
  }


  logout(): void {
    this.authService.logout();
  }

  loadUnreadChatCount(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.teamChatService.getUnreadCount(userId).subscribe({
        next: count => this.unreadChatCount = count,
        error: err => console.error('Error loading chat count', err)
      });
    }
  }

  loadReportStatus(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.dailyReportService.getMyReport(userId).subscribe({
        next: (report) => this.reportSubmitted = !!report,
        error: () => this.reportSubmitted = true
      });
    }
  }

  loadPrimes(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.primeService.getMyAffectations(userId).subscribe(data => {
        this.newPrimesCount = data.filter(a => a.status === 'VALIDÉE').length;
      });
    }
  }

  loadActiveTicketsCount(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.ticketService.getTicketsByEmployee(userId).subscribe(data => {
        this.activeTicketsCount = data.filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;
      });
    }
  }

  loadTodayTasks(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.employeeService.getMyTasks(userId).subscribe((tasks: any[]) => {
        // We still keep the list for other potential uses, but only pending ones
        this.todayTasks = tasks.filter((t: any) => t.status !== 'DONE' && t.status !== 'COMPLETED');
      });

      // Get accurate count (Tasks + Subtasks)
      this.employeeService.getTodoCount(userId).subscribe(res => {
        this.todoCount = res.count;
      });
    }
  }

  toggleTaskStatus(task: any): void {
    const newStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    this.employeeService.updateTaskStatus(task.id, newStatus).subscribe(() => {
      this.loadTodayTasks();
    });
  }
}