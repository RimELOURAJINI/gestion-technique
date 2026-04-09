import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { TicketChatComponent } from '../../shared/ticket-chat/ticket-chat.component';

@Component({
  selector: 'app-commercial-tickets',
  standalone: true,
  imports: [CommonModule, TicketChatComponent],
  template: `
    <div class="p-4">
      <div class="mb-4">
        <h4 class="fw-bold text-dark mb-1">Discussions Clients</h4>
        <p class="text-muted small">Consultez les tickets de support et participez aux discussions sur vos projets.</p>
      </div>

      <div class="row g-4">
        <!-- Liste des Tickets -->
        <div class="col-xl-4 col-md-6" *ngFor="let ticket of tickets">
          <div class="card border-0 shadow-sm h-100 ticket-card clickable" (click)="openTicket(ticket)">
            <div class="card-body p-4 text-center">
              <div class="avatar avatar-md bg-soft-info text-info rounded-circle mb-3 mx-auto d-flex align-items-center justify-content-center">
                <i class="ti ti-messages fs-24"></i>
              </div>
              <h5 class="fw-bold text-dark mb-1">{{ ticket.title }}</h5>
              <p class="text-muted fs-12 mb-3">Projet: {{ ticket.project?.name }}</p>
              
              <div class="d-flex justify-content-between align-items-center px-3 mb-2">
                <span class="fs-11 text-muted">Statut</span>
                <span class="badge rounded-pill px-3 py-1 fs-10 fw-bold" [ngClass]="getStatusClass(ticket.status)">
                  {{ ticket.status }}
                </span>
              </div>
              <div class="d-flex justify-content-between align-items-center px-3">
                <span class="fs-11 text-muted">Dernier message</span>
                <span class="text-dark fs-11 fw-medium">{{ ticket.lastActive | date:'shortTime' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="tickets.length === 0" class="text-center py-5">
        <i class="ti ti-message-off fs-1 text-muted opacity-25 d-block mb-3"></i>
        <h5 class="text-muted">Aucune discussion client en cours.</h5>
      </div>
    </div>

    <!-- Modal Chat Overlay -->
    <div class="chat-overlay shadow-lg" *ngIf="selectedTicket" style="animation: slideInRight 0.3s ease-out;">
      <div class="chat-header d-flex justify-content-between align-items-center p-3 text-white">
        <div class="d-flex align-items-center">
          <button class="btn btn-link text-white p-0 me-2" (click)="selectedTicket = null">
            <i class="ti ti-arrow-left fs-20"></i>
          </button>
          <div>
            <h6 class="mb-0 fw-bold text-white">{{ selectedTicket.title }}</h6>
            <small class="opacity-75 fs-11">Discussion en direct</small>
          </div>
        </div>
        <button class="btn-close btn-close-white" (click)="selectedTicket = null"></button>
      </div>
      <div class="chat-body scrollable-chat">
        <app-ticket-chat [ticketId]="selectedTicket.id"></app-ticket-chat>
      </div>
    </div>
  `,
  styles: [`
    .ticket-card { transition: all 0.2s ease; cursor: pointer; border-bottom: 2px solid transparent; }
    .ticket-card:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important; border-bottom-color: #0d6efd; }
    .bg-soft-info { background-color: #e0f2fe; }
    .chat-overlay { position: fixed; top: 0; right: 0; width: 450px; height: 100vh; background: #fff; z-index: 1050; display: flex; flex-direction: column; }
    .chat-header { background: #0d6efd; }
    .scrollable-chat { flex-grow: 1; overflow-y: auto; }
    @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
  `]
})
export class TicketsComponent implements OnInit {
  tickets: any[] = [];
  selectedTicket: any = null;

  constructor(
    private adminService: AdminService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets() {
    this.adminService.getAllTickets().subscribe(res => {
      // Filtrer les tickets liés aux projets du commercial ou simplement charger tout pour le démo
      this.tickets = res;
    });
  }

  openTicket(ticket: any) {
    this.selectedTicket = ticket;
  }

  getStatusClass(status: string) {
    switch(status) {
      case 'OPEN': return 'bg-success text-white';
      case 'CLOSED': return 'bg-secondary text-white';
      default: return 'bg-primary text-white';
    }
  }
}
