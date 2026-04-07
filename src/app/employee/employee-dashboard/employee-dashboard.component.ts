import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { NotificationService, NotificationDTO } from '../../services/notification.service';
import { AiChatbotComponent } from '../../shared/ai-chatbot/ai-chatbot.component';
import { interval, Subscription } from 'rxjs';


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
  tasksMenuOpen: boolean = false;
  dashboardMenuOpen: boolean = false;
  private notificationSub?: Subscription;


  constructor(
    public router: Router,
    public authService: AuthService,
    private notificationService: NotificationService
  ) {}


  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    this.employeeName = `${firstName} ${lastName}`.trim() || 'Employé';
    this.employeeRole = user.roles ? user.roles[0] : 'Employé';
    const parts = this.employeeName.split(' ');
    this.employeeInitials = parts.map((p: string) => p[0]).join('').toUpperCase().substring(0, 2);

    this.loadNotifications();
    // Poll for new notifications every 30 seconds
    this.notificationSub = interval(30000).subscribe(() => this.loadNotifications());

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
    if (this.notificationSub) {
      this.notificationSub.unsubscribe();
    }
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
}