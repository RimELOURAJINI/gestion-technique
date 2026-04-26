import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService, NotificationDTO } from '../../services/notification.service';
import { AiChatbotComponent } from '../../shared/ai-chatbot/ai-chatbot.component';
import { DailyReportService } from '../../services/daily-report.service';
import { PrimeService } from '../../services/prime.service';
import { TicketService } from '../../services/ticket.service';
import { interval, Subscription } from 'rxjs';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, AiChatbotComponent],
    templateUrl: './admin-dashboard.component.html',
    styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
    adminName: string = '';
    adminRole: string = 'Administrateur';
    notifications: NotificationDTO[] = [];
    unreadCount: number = 0;
    unsubmittedReportCount: number = 0;
    pendingPrimesCount: number = 0;
    activeTicketsCount: number = 0;
    dashboardMenuOpen: boolean = false;
    usersMenuOpen: boolean = false;
    configMenuOpen: boolean = false;
    private notificationSub?: Subscription;

    constructor(
        public authService: AuthService,
        private notificationService: NotificationService,
        private dailyReportService: DailyReportService,
        public primeService: PrimeService,
        private ticketService: TicketService,
        public router: Router
    ) { }

    ngOnInit(): void {
        const user = this.authService.currentUserValue;
        if (user) {
            const firstName = user.firstName || '';
            const lastName = user.lastName || '';
            this.adminName = `${firstName} ${lastName}`.trim() || 'Admin';
            this.adminRole = user.roles ? user.roles[0] : 'Administrateur';
            
            if (user.id) {
                this.loadNotifications(user.id);
                this.loadUnsubmittedCount();
                this.loadPendingPrimesCount();
                this.loadActiveTicketsCount();
                // Poll for new notifications every 30 seconds
                this.notificationSub = interval(30000).subscribe(() => {
                    const currentId = this.authService.getUserId();
                    if (currentId) this.loadNotifications(currentId);
                    this.loadUnsubmittedCount();
                    this.loadPendingPrimesCount();
                    this.loadActiveTicketsCount();
                });
            }

            // Auto-open menus based on route
            if (this.router.url.includes('/admin/overview')) this.dashboardMenuOpen = true;
            if (this.router.url.includes('/admin/users') || this.router.url.includes('/admin/teams')) this.usersMenuOpen = true;
        }
    }

    ngOnDestroy(): void {
        if (this.notificationSub) {
            this.notificationSub.unsubscribe();
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

    loadUnsubmittedCount(): void {
        this.dailyReportService.getUnsubmittedCount().subscribe({
            next: (count) => this.unsubmittedReportCount = count,
            error: () => {}
        });
    }

    loadPendingPrimesCount(): void {
        this.primeService.refreshPendingCount();
        this.primeService.pendingCount$.subscribe(count => {
            this.pendingPrimesCount = count;
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

    toggleDashboardMenu() {
        this.dashboardMenuOpen = !this.dashboardMenuOpen;
    }

    toggleUsersMenu() {
        this.usersMenuOpen = !this.usersMenuOpen;
    }

    toggleConfigMenu() {
        this.configMenuOpen = !this.configMenuOpen;
    }

    loadActiveTicketsCount(): void {
        this.ticketService.getAllTickets().subscribe(data => {
            this.activeTicketsCount = data.filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;
        });
    }
}

