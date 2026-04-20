import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService, NotificationDTO } from '../../services/notification.service';
import { AiChatbotComponent } from '../../shared/ai-chatbot/ai-chatbot.component';
import { TeamChatService } from '../../services/team-chat.service';
import { DailyReportService } from '../../services/daily-report.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-commercial-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, AiChatbotComponent],
  templateUrl: './commercial-dashboard.component.html',
  styleUrl: './commercial-dashboard.component.css'
})
export class CommercialDashboardComponent implements OnInit, OnDestroy {
  commercialName: string = '';
  commercialRole: string = 'Commercial';
  notifications: NotificationDTO[] = [];
  unreadCount: number = 0;
  unreadChatCount: number = 0;
  reportSubmitted: boolean = true;
  projectsMenuOpen: boolean = true;
  private notificationSub?: Subscription;
  private chatCountSub?: Subscription;

  constructor(
    public authService: AuthService,
    private notificationService: NotificationService,
    private teamChatService: TeamChatService,
    private dailyReportService: DailyReportService,
    public router: Router
  ) { }

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';
      this.commercialName = `${firstName} ${lastName}`.trim() || 'Commercial';
      this.commercialRole = (user.roles && user.roles.length > 0) ? user.roles[0] : 'Commercial';

      if (user.id) {
        this.loadNotifications(user.id);
        this.loadUnreadChatCount(user.id);
        this.loadReportStatus(user.id);
        this.notificationSub = interval(30000).subscribe(() => {
          const currentId = this.authService.getUserId();
          if (currentId) {
            this.loadNotifications(currentId);
            this.loadUnreadChatCount(currentId);
          }
        });
      }
    }
  }

  ngOnDestroy(): void {
    if (this.notificationSub) {
      this.notificationSub.unsubscribe();
    }
    if (this.chatCountSub) {
      this.chatCountSub.unsubscribe();
    }
  }

  loadNotifications(userId: number) {
    this.notificationService.getUnreadNotifications(userId).subscribe({
      next: (data) => {
        this.notifications = data;
        this.unreadCount = data.length;
      },
      error: (err) => console.error('Erreur chargement notifications', err)
    });
  }

  loadUnreadChatCount(userId: number): void {
    this.teamChatService.getUnreadCount(userId).subscribe({
      next: count => this.unreadChatCount = count,
      error: err => console.error('Error loading chat count', err)
    });
  }

  markAsRead(id: number) {
    this.notificationService.markAsRead(id).subscribe(() => {
      const userId = this.authService.getUserId();
      if (userId) this.loadNotifications(userId);
    });
  }

  markAllAsRead(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.notificationService.markAllAsRead(userId).subscribe(() => {
        this.loadNotifications(userId);
      });
    }
  }

  logout() {
    this.authService.logout();
  }

  toggleProjectsMenu() {
    this.projectsMenuOpen = !this.projectsMenuOpen;
  }

  loadReportStatus(userId: number): void {
    this.dailyReportService.getMyReport(userId).subscribe({
      next: (report) => this.reportSubmitted = !!report,
      error: () => this.reportSubmitted = true
    });
  }
}
