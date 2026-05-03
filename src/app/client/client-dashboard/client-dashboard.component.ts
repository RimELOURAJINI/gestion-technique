import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { Project } from '../../models/models';
import { TicketService } from '../../services/ticket.service';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './client-dashboard.component.html',
  styleUrl: './client-dashboard.component.css'
})
export class ClientDashboardComponent implements OnInit {
  clientName = '';

  activeTicketsCount: number = 0;
  unreadCount = 0;
  notifications: any[] = [];
  clientRole = 'Client Officiel';

  constructor(
    private authService: AuthService,
    private ticketService: TicketService
  ) {}

  ngOnInit() {
    this.clientName = localStorage.getItem('userName') || 'Client';
    this.loadActiveTicketsCount();
  }

  loadActiveTicketsCount(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.ticketService.getUnansweredTicketsCountForUser(userId).subscribe(count => {
        this.activeTicketsCount = count;
      });
    }
  }

  logout() {
    this.authService.logout();
  }
}
