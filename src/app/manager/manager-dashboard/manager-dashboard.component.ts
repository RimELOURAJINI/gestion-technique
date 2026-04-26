import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService, NotificationDTO } from '../../services/notification.service';
import { AiChatbotComponent } from '../../shared/ai-chatbot/ai-chatbot.component';
import { interval, Subscription } from 'rxjs';
import { TeamChatService } from '../../services/team-chat.service';
import { DailyReportService } from '../../services/daily-report.service';
import { PrimeService } from '../../services/prime.service';
import { TicketService } from '../../services/ticket.service';


@Component({
    selector: 'app-manager-dashboard',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, AiChatbotComponent],
    templateUrl: './manager-dashboard.component.html',
    styleUrl: './manager-dashboard.component.css'
})
export class ManagerDashboardComponent implements OnInit {
    managerName: string = '';
    managerRole: string = 'Chef d\'Équipe';
    basePath: string = '/manager';
    spaceTitle: string = 'Espace Manager';
    sidebarTitle: string = 'Mon Espace Manager';
    notifications: NotificationDTO[] = [];
    unreadCount: number = 0;
    unreadChatCount: number = 0;
    reportSubmitted: boolean = true; // true = no warning dot shown
    newPrimesCount: number = 0;
    activeTicketsCount: number = 0;
    private notificationSub?: Subscription;
    private chatCountSub?: Subscription;


    constructor(
        public authService: AuthService,
        private notificationService: NotificationService,
        private teamChatService: TeamChatService,
        private dailyReportService: DailyReportService,
        private primeService: PrimeService,
        private ticketService: TicketService
    ) { }


    ngOnInit(): void {
        const user = this.authService.currentUserValue;
        if (user) {
            const firstName = user.firstName || '';
            const lastName = user.lastName || '';
            this.managerName = `${firstName} ${lastName}`.trim() || 'Manager';
            
            const roles = user.roles || [];
            if (roles.includes('ROLE_TEAM_LEADER')) {
                this.managerRole = 'Chef d\'Équipe';
            } else if (roles.includes('ROLE_COMMERCIAL_LEADER')) {
                this.managerRole = 'Commercial Leader';
            } else {
                this.managerRole = roles[0] || 'Responsable';
            }

            this.basePath = this.authService.isCommercialLeader() ? '/commercial-leader' : '/manager';
            this.spaceTitle = this.authService.isCommercialLeader() ? 'Espace Commercial Leader' : 'Espace Manager';
            this.sidebarTitle = this.authService.isCommercialLeader() ? 'Mon Espace Leader' : 'Mon Espace Manager';

            if (user.id) {
                this.loadNotifications(user.id);
                this.loadReportStatus(user.id);
                this.loadPrimes(user.id);
                this.loadActiveTicketsCount(user.id);
                // Poll for new notifications every 30 seconds
                this.notificationSub = interval(30000).subscribe(() => {
                    const currentId = this.authService.getUserId();
                    if (currentId) {
                        this.loadNotifications(currentId);
                        this.loadUnreadChatCount(currentId);
                        this.loadPrimes(currentId);
                        this.loadActiveTicketsCount(currentId);
                    }
                });
                this.loadUnreadChatCount(user.id);
            }
        }
    }

    ngOnDestroy(): void {
        if (this.notificationSub) this.notificationSub.unsubscribe();
        if (this.chatCountSub) this.chatCountSub.unsubscribe();
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

    loadUnreadChatCount(userId: number) {
        this.teamChatService.getUnreadCount(userId).subscribe({
            next: (count) => this.unreadChatCount = count,
            error: (err) => console.error('Erreur unread chat count', err)
        });
    }

    loadReportStatus(userId: number): void {
        this.dailyReportService.getMyReport(userId).subscribe({
            next: (report) => this.reportSubmitted = !!report,
            error: () => this.reportSubmitted = true
        });
    }

    loadPrimes(userId: number): void {
        this.primeService.getMyAffectations(userId).subscribe(data => {
            this.newPrimesCount = data.filter(a => a.status === 'VALIDÉE').length;
        });
    }

    loadActiveTicketsCount(userId: number): void {
        this.ticketService.getTicketsByManager(userId).subscribe(data => {
            this.activeTicketsCount = data.filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED').length;
        });
    }
}
