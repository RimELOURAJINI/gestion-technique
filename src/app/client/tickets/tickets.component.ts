import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';
import { TicketChatComponent } from '../../shared/ticket-chat/ticket-chat.component';

@Component({
  selector: 'app-client-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule, TicketChatComponent],
  template: `
    <div class="container-fluid p-4">
      <div class="row mb-4 align-items-center">
        <div class="col">
          <h4 class="fw-bold mb-1 text-dark">Centre de Support Client</h4>
          <p class="text-muted">Gérez vos demandes de support et communiquez avec nos équipes.</p>
        </div>
        <div class="col-auto">
          <button class="btn btn-primary rounded-pill px-4 shadow-sm" (click)="showCreateModal = true">
            <i class="ti ti-plus me-1"></i> Nouveau Ticket
          </button>
        </div>
      </div>

      <!-- Tickets Grid (Clickable Blocks) -->
      <div class="row">
        <div *ngFor="let ticket of tickets" class="col-md-6 col-xl-4 mb-4">
          <div class="card border-0 shadow-sm ticket-card h-100" (click)="openChat(ticket)">
            <div class="card-body p-4">
              <div class="d-flex justify-content-between mb-3">
                <span class="badge rounded-pill px-3" 
                      [ngClass]="getStatusClass(ticket.status)">
                  {{ ticket.status }}
                </span>
                <span class="text-muted fs-11">{{ ticket.createdAt | date }}</span>
              </div>
              <h6 class="fw-bold mb-2 text-dark">{{ ticket.subject }}</h6>
              <p class="text-muted fs-13 mb-4 text-truncate-2">{{ ticket.description }}</p>
              
              <div class="d-flex align-items-center mt-auto border-top pt-3">
                 <div class="avatar-group me-auto">
                   <div class="avatar-xs bg-light rounded-circle border border-white text-center">
                      <i class="ti ti-user fs-10"></i>
                   </div>
                 </div>
                 <div class="text-primary fs-12 fw-bold">
                   <i class="ti ti-messages me-1"></i> Discuter
                 </div>
              </div>
            </div>
            <!-- Client Validation Overlay if Resolved -->
            <div *ngIf="ticket.status === 'Resolved'" class="resolution-badge position-absolute top-0 end-0 m-3">
               <span class="badge bg-warning text-dark border shadow-sm">Validation Requise</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Sidebar / Modal Overlay -->
      <div class="chat-overlay" *ngIf="selectedTicket" (click)="closeChat()">
        <div class="chat-content" (click)="$event.stopPropagation()">
           <!-- Validation Actions Bar for Client -->
           <div class="bg-warning-soft p-3 mb-2 rounded-4 d-flex justify-content-between align-items-center" *ngIf="selectedTicket.status === 'Resolved'">
              <span class="fw-bold text-dark fs-13">Le problème est-il résolu pour vous ?</span>
              <div>
                 <button class="btn btn-sm btn-success rounded-pill px-3 me-2" (click)="validateTicket(selectedTicket, 'Closed')">Oui, Fermer</button>
                 <button class="btn btn-sm btn-outline-danger rounded-pill px-3" (click)="validateTicket(selectedTicket, 'Reopened')">Non, Réouvrir</button>
              </div>
           </div>
           
           <app-ticket-chat [ticket]="selectedTicket" [onClose]="closeChat.bind(this)"></app-ticket-chat>
        </div>
      </div>

      <!-- Create Ticket Modal -->
      <div class="modal-backdrop fade show" *ngIf="showCreateModal"></div>
      <div class="modal fade show d-block" *ngIf="showCreateModal">
         <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg rounded-4">
               <div class="modal-header border-0 p-4 pb-0">
                  <h5 class="fw-bold">Nouveau Ticket de Support</h5>
                  <button type="button" class="btn-close" (click)="showCreateModal = false"></button>
               </div>
               <div class="modal-body p-4">
                  <div class="mb-3">
                     <label class="form-label text-muted fs-12 fw-bold">PROJET CONCERNÉ</label>
                     <select class="form-select border-0 bg-light" [(ngModel)]="newTicket.projectId">
                        <option [value]="null">Sélectionnez un projet...</option>
                        <option *ngFor="let p of availableProjects" [value]="p.id">{{ p.name }}</option>
                     </select>
                  </div>
                  <div class="mb-3">
                     <label class="form-label text-muted fs-12 fw-bold">SUJET</label>
                     <input type="text" class="form-control border-0 bg-light" [(ngModel)]="newTicket.subject" placeholder="Ex: Problème d'accès à l'API">
                  </div>
                  <div class="mb-4">
                     <label class="form-label text-muted fs-12 fw-bold">DESCRIPTION</label>
                     <textarea class="form-control border-0 bg-light" rows="4" [(ngModel)]="newTicket.description" placeholder="Décrivez votre besoin en détail..."></textarea>
                  </div>
                  <button class="btn btn-primary w-100 rounded-pill py-2 shadow-sm" (click)="createTicket()">Envoyer le Ticket</button>
               </div>
            </div>
         </div>
      </div>
    </div>
  `,
  styles: [`
    .ticket-card { cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid rgba(0,0,0,0.05) !important; position: relative; }
    .ticket-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important; border-color: #4e73df !important; }
    .chat-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); z-index: 1050; display: flex; align-items: center; justify-content: flex-end; }
    .chat-content { margin-right: 30px; animation: slideIn 0.3s ease-out; }
    @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    .text-truncate-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .bg-warning-soft { background-color: #fff4e5; border: 1px solid #ffe8cc; }
    .bg-soft-primary { background-color: #eef2ff; }
    .bg-soft-success { background-color: #ecfdf5; }
    .bg-soft-warning { background-color: #fffbeb; }
  `]
})
export class ClientTicketsComponent implements OnInit {
  tickets: any[] = [];
  availableProjects: any[] = [];
  selectedTicket: any = null;
  showCreateModal: boolean = false;
  newTicket: any = { subject: '', description: '', projectId: null };

  constructor(
    private ticketService: TicketService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const userId = this.authService.getUserId();
    if (userId) {
      this.ticketService.getClientTickets(userId).subscribe(data => this.tickets = data);
      this.ticketService.getClientProjects(userId).subscribe(data => this.availableProjects = data);
    }
  }

  openChat(ticket: any) {
    this.selectedTicket = ticket;
  }

  closeChat() {
    this.selectedTicket = null;
    this.loadData();
  }

  createTicket() {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.ticketService.createTicket(userId, this.newTicket).subscribe(() => {
      this.showCreateModal = false;
      this.newTicket = { subject: '', description: '', projectId: null };
      this.loadData();
    });
  }

  validateTicket(ticket: any, status: string) {
    this.ticketService.validateTicketResolution(ticket.id, status).subscribe(() => {
       this.closeChat();
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Open': return 'bg-soft-primary text-primary';
      case 'Resolved': return 'bg-soft-warning text-warning';
      case 'Closed': return 'bg-soft-success text-success';
      default: return 'bg-light text-muted';
    }
  }
}
