import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService, NotificationDTO } from '../../services/notification.service';
import { AiChatbotComponent } from '../../shared/ai-chatbot/ai-chatbot.component';
import { interval, Subscription } from 'rxjs';


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
    notifications: NotificationDTO[] = [];
    unreadCount: number = 0;
    private notificationSub?: Subscription;


    constructor(
        public authService: AuthService,
        private notificationService: NotificationService
    ) { }


    ngOnInit(): void {
        const user = this.authService.currentUserValue;
        if (user) {
            const firstName = user.firstName || '';
            const lastName = user.lastName || '';
            this.managerName = `${firstName} ${lastName}`.trim() || 'Manager';
            this.managerRole = user.roles ? user.roles[0] : 'Chef d\'Équipe';

            if (user.id) {
                this.loadNotifications(user.id);
                // Poll for new notifications every 30 seconds
                this.notificationSub = interval(30000).subscribe(() => {
                    const currentId = this.authService.getUserId();
                    if (currentId) this.loadNotifications(currentId);
                });
            }
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
}
