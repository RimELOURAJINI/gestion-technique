import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DealService } from '../../services/deal.service';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/models';
import { DealNegotiationComponent } from '../../shared/deal-negotiation/deal-negotiation.component';
import { TicketService } from '../../services/ticket.service';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-commercial-deals',
  standalone: true,
  imports: [CommonModule, FormsModule, DealNegotiationComponent, DragDropModule],
  template: `
    <div class="p-4" *ngIf="!selectedDealChat">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 class="fw-bold text-dark mb-1">Espace Deals & Propositions</h4>
          <p class="text-muted small">Gérez vos opportunités commerciales et collaborez avec vos clients.</p>
        </div>
        <div class="d-flex gap-2">
            <div class="btn-group p-1 bg-light rounded-3 shadow-sm me-2">
                <button class="btn btn-sm px-3" [class.btn-white]="viewMode === 'list'" [class.shadow-sm]="viewMode === 'list'" (click)="viewMode = 'list'">
                    <i class="ti ti-list"></i> Liste
                </button>
                <button class="btn btn-sm px-3" [class.btn-white]="viewMode === 'kanban'" [class.shadow-sm]="viewMode === 'kanban'" (click)="viewMode = 'kanban'">
                    <i class="ti ti-layout-kanban"></i> Kanban
                </button>
            </div>
            <button class="btn btn-primary d-flex align-items-center gap-2" (click)="showCreateForm = !showCreateForm">
              <i class="ti" [ngClass]="showCreateForm ? 'ti-x' : 'ti-plus'"></i>
              {{ showCreateForm ? 'Annuler' : 'Nouvelle Proposition' }}
            </button>
        </div>
      </div>

      <!-- Onglets -->
      <ul class="nav nav-tabs border-0 mb-4 bg-light p-1 rounded-3">
        <li class="nav-item">
          <button class="nav-link border-0 rounded-2 py-2 px-4" [class.active]="activeTab === 'my-deals'" (click)="activeTab = 'my-deals'">
            <i class="ti ti-briefcase me-1"></i> Mes Deals
          </button>
        </li>
        <li class="nav-item">
          <button class="nav-link border-0 rounded-2 py-2 px-4 position-relative" [class.active]="activeTab === 'incoming'" (click)="activeTab = 'incoming'">
            <i class="ti ti-bell-ringing me-1"></i> Nouvelles Demandes
            <span *ngIf="unassignedDeals.length > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-white">
              {{ unassignedDeals.length }}
            </span>
          </button>
        </li>
      </ul>

      <!-- Formulaire de création -->
      <div class="card border-0 shadow-sm mb-4" *ngIf="showCreateForm" style="animation: slideDown 0.3s ease-out;">
        <div class="card-body p-4">
          <h6 class="fw-bold mb-3">Détails de la proposition</h6>
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-medium fs-13">Titre du Projet *</label>
              <input type="text" class="form-control" [(ngModel)]="newDeal.name" placeholder="Ex: Refonte Site E-commerce">
            </div>
            <div class="col-md-6">
              <label class="form-label fw-medium fs-13">Client (Optionnel)</label>
              <select class="form-select" [(ngModel)]="newDeal.clientId">
                <option [ngValue]="null">-- Sans client spécifique --</option>
                <option *ngFor="let client of clients" [ngValue]="client.id">{{ client.firstName }} {{ client.lastName }}</option>
              </select>
            </div>
            <div class="col-md-6">
              <label class="form-label fw-medium fs-13">Budget Estimé (€) *</label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0">€</span>
                <input type="number" class="form-control" [(ngModel)]="newDeal.budget" placeholder="0.00">
              </div>
            </div>
            <div class="col-md-12">
              <label class="form-label fw-medium fs-13">Description & Portée</label>
              <textarea class="form-control" rows="3" [(ngModel)]="newDeal.description" placeholder="Détaillez les besoins du client..."></textarea>
            </div>
            <div class="col-md-12 text-end mt-4">
              <button class="btn btn-primary px-4" (click)="saveDeal()" [disabled]="!isFormValid()">
                Enregistrer le Brouillon
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Vue : Mes Deals (LIST) -->
      <div class="row g-4" *ngIf="activeTab === 'my-deals' && viewMode === 'list'">
        <div class="col-xl-4 col-md-6" *ngFor="let deal of deals">
          <div class="card border-0 shadow-sm h-100 deal-card">
            <div class="card-body p-4">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <span class="badge rounded-pill px-3 py-1 fs-10 fw-bold text-uppercase" [ngClass]="getStatusClass(deal.status)">
                  {{ getStatusLabel(deal.status) }}
                </span>
                <span class="text-muted fs-11">{{ deal.createdAt | date:'shortDate' }}</span>
              </div>
              <h5 class="fw-bold text-dark mb-2">{{ deal.name }}</h5>
              <div class="d-flex align-items-center mb-4">
                <div class="avatar-xs bg-soft-primary text-primary rounded-circle d-flex align-items-center justify-content-center me-2 fs-10 fw-bold">
                  {{ deal.client?.firstName?.charAt(0) }}
                </div>
                <span class="text-muted fs-12">{{ deal.client?.firstName }} {{ deal.client?.lastName }}</span>
              </div>

              <div class="bg-light p-3 rounded-3 mb-4">
                <div class="d-flex justify-content-between align-items-center">
                  <span class="fs-12 text-muted">Budget Proposition</span>
                  <span class="fs-14 fw-bold text-dark">{{ deal.budget | number:'1.2-2' }} €</span>
                </div>
              </div>

              <div class="d-grid gap-2">
                <button *ngIf="deal.status === 'PROPOSITION'" class="btn btn-primary btn-sm" (click)="updateStatus(deal, 'PENDING_CLIENT')">
                  Envoyer au Client <i class="ti ti-send ms-1"></i>
                </button>
                <button class="btn btn-primary btn-sm d-flex align-items-center justify-content-center gap-2" (click)="openChat(deal)">
                   <i class="ti ti-messages fs-16"></i> Entrer dans le Workspace
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Vue : Mes Deals (KANBAN) -->
      <div class="kanban-wrapper overflow-auto" *ngIf="activeTab === 'my-deals' && viewMode === 'kanban'" cdkDropListGroup>
          <div class="d-flex gap-3 pb-3" style="min-width: 1200px;">
              <div class="kanban-column flex-fill" *ngFor="let col of kanbanColumns">
                  <div class="d-flex justify-content-between align-items-center mb-3 bg-light p-2 rounded-3">
                      <h6 class="fw-bold mb-0 fs-13 text-uppercase">{{ col.label }}</h6>
                      <span class="badge bg-white text-dark border shadow-sm">{{ getDealsByStatus(col.statuses).length }}</span>
                  </div>
                  <div class="kanban-list d-flex flex-column gap-3 h-100" 
                       cdkDropList 
                       [cdkDropListData]="col.statuses[0]"
                       (cdkDropListDropped)="onDrop($event)">
                      <div class="card border-0 shadow-sm border-start border-3 clickable-card transition" 
                           *ngFor="let deal of getDealsByStatus(col.statuses)"
                           cdkDrag
                           [cdkDragData]="deal"
                           (click)="openChat(deal)"
                           [class.border-primary]="col.color === 'primary'"
                           [class.border-warning]="col.color === 'warning'"
                           [class.border-success]="col.color === 'success'">
                          <div class="card-body p-3">
                              <div class="d-flex justify-content-between align-items-start mb-2">
                                <h6 class="fw-bold fs-14 mb-0">{{ deal.name }}</h6>
                                <span class="badge bg-soft-secondary text-muted fs-9" *ngIf="deal.statusDurations && deal.statusDurations[deal.status]">
                                  <i class="ti ti-clock me-1"></i>{{ formatDuration(deal.statusDurations[deal.status]) }}
                                </span>
                              </div>
                              
                              <!-- Duration Breakdown (Tooltip-like) -->
                              <div class="mb-2 d-flex flex-wrap gap-1" *ngIf="deal.statusDurations">
                                <span *ngFor="let item of deal.statusDurations | keyvalue" 
                                      class="badge rounded-pill bg-light text-muted border fs-8"
                                      [title]="getStatusLabel($any(item.key).toString()) + ': ' + formatDuration($any(item.value))">
                                  {{ $any(item.key).toString().substring(0,2) }}: {{ formatDuration($any(item.value)) }}
                                </span>
                              </div>

                              <div class="d-flex align-items-center mb-3">
                                  <div class="avatar-xs bg-light rounded-circle me-2 d-flex align-items-center justify-content-center fs-10" *ngIf="deal.client">
                                      {{ deal.client?.firstName?.charAt(0) }}
                                  </div>
                                  <span class="text-muted fs-11" *ngIf="deal.client">{{ deal.client?.firstName }} {{ deal.client?.lastName }}</span>
                                  <span class="text-muted fs-11" *ngIf="!deal.client"><i class="ti ti-user-x me-1"></i>Aucun client</span>
                              </div>
                              <div class="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                                  <span class="fw-bold fs-13 text-dark">{{ deal.budget | number:'1.0-0' }} €</span>
                                  <div class="d-flex gap-1">
                                    <button class="btn btn-icon btn-xs btn-soft-danger rounded-circle position-relative" (click)="openTickets(deal); $event.stopPropagation()" title="Gérer les tickets">
                                        <i class="ti ti-ticket"></i>
                                        <span class="badge rounded-pill bg-danger position-absolute top-0 start-100 translate-middle border border-white" 
                                              *ngIf="deal.ticketsCount > 0" style="font-size: 7px; padding: 2px 4px;">
                                          {{ deal.ticketsCount }}
                                        </span>
                                    </button>
                                    <div class="btn btn-icon btn-xs btn-soft-primary rounded-circle">
                                        <i class="ti ti-chevron-right"></i>
                                    </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <!-- Vue : Demandes Clients -->
      <div class="row g-4" *ngIf="activeTab === 'incoming'">
        <div class="col-xl-4 col-md-6" *ngFor="let deal of unassignedDeals">
          <div class="card border-0 shadow-sm h-100 border-start border-4 border-info">
            <div class="card-body p-4">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <span class="badge bg-soft-info text-info rounded-pill px-3 py-1 fs-10 fw-bold">NOUVELLE DEMANDE</span>
                <span class="text-muted fs-11">{{ deal.createdAt | date:'shortDate' }}</span>
              </div>
              <h5 class="fw-bold text-dark mb-2">{{ deal.name }}</h5>
              <div class="d-flex align-items-center mb-4">
                 <div class="avatar-xs bg-soft-primary text-primary rounded-circle d-flex align-items-center justify-content-center me-2 fs-10 fw-bold">
                   {{ deal.client?.firstName?.charAt(0) }}
                 </div>
                 <span class="text-muted fs-12">{{ deal.client?.firstName }} {{ deal.client?.lastName }}</span>
              </div>
              <p class="text-muted fs-12 mb-4 line-clamp-2">{{ deal.description }}</p>
              <div class="bg-light p-3 rounded-3 mb-4">
                 <div class="d-flex justify-content-between align-items-center">
                   <span class="fs-11 text-muted">Budget souhaité</span>
                   <span class="fs-13 fw-bold text-dark">{{ deal.budget | number:'1.2-2' }} €</span>
                 </div>
              </div>
              <button class="btn btn-info w-100 d-flex align-items-center justify-content-center gap-2" (click)="assignToMe(deal)">
                <i class="ti ti-user-plus"></i> Prendre en charge
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Ticket Management View -->
    <div class="deal-tickets-overlay p-4" *ngIf="selectedDealTickets">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div class="d-flex align-items-center">
                <button class="btn btn-soft-secondary me-3" (click)="selectedDealTickets = null">
                    <i class="ti ti-arrow-left"></i>
                </button>
                <h4 class="mb-0 fw-bold">Tickets : {{ selectedDealTickets.name }}</h4>
            </div>
            <button class="btn btn-primary btn-sm" (click)="showNewTicketForm = true" *ngIf="!showNewTicketForm">
                <i class="ti ti-plus"></i> Nouveau Ticket
            </button>
        </div>

        <div class="row g-4">
            <div class="col-lg-4" *ngIf="showNewTicketForm">
                <div class="card border-0 shadow-sm rounded-4">
                    <div class="card-body p-4">
                        <h6 class="fw-bold mb-3">Créer un ticket</h6>
                        <div class="mb-3">
                            <label class="form-label fs-13">Sujet</label>
                            <input type="text" class="form-control" [(ngModel)]="newTicket.subject">
                        </div>
                        <div class="mb-3">
                            <label class="form-label fs-13">Description</label>
                            <textarea class="form-control" rows="4" [(ngModel)]="newTicket.description"></textarea>
                        </div>
                        <div class="d-flex gap-2">
                            <button class="btn btn-light flex-fill" (click)="showNewTicketForm = false">Annuler</button>
                            <button class="btn btn-primary flex-fill" (click)="saveTicket()">Enregistrer</button>
                        </div>
                    </div>
                </div>
            </div>
            <div [class]="showNewTicketForm ? 'col-lg-8' : 'col-lg-12'">
                <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
                    <div class="table-responsive">
                        <table class="table mb-0">
                            <thead class="bg-light">
                                <tr>
                                    <th class="ps-4">Ticket</th>
                                    <th>Statut</th>
                                    <th>Créé le</th>
                                    <th class="text-end pe-4">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr *ngFor="let t of dealTickets">
                                    <td class="ps-4">
                                        <div class="fw-bold">{{ t.subject }}</div>
                                        <div class="text-muted small text-truncate" style="max-width: 200px;">{{ t.description }}</div>
                                    </td>
                                    <td>
                                        <span class="badge rounded-pill" [ngClass]="t.status === 'VALIDATED' ? 'bg-success' : 'bg-warning'">
                                            {{ t.status }}
                                        </span>
                                    </td>
                                    <td>{{ t.createdAt | date:'shortDate' }}</td>
                                    <td class="text-end pe-4">
                                        <button class="btn btn-sm btn-soft-primary" (click)="openChat(selectedDealTickets, t.id)">
                                            <i class="ti ti-messages"></i> Chat
                                        </button>
                                    </td>
                                </tr>
                                <tr *ngIf="dealTickets.length === 0">
                                    <td colspan="4" class="text-center py-5 text-muted">
                                        Aucun ticket associé à ce deal.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Negotiation Interface (Full Screen) -->
    <app-deal-negotiation 
      *ngIf="selectedDealChat" 
      [deal]="selectedDealChat" 
      [isAdmin]="false" 
      [isCommercial]="true" 
      (onClose)="selectedDealChat = null">
    </app-deal-negotiation>
  `,
  styles: [`
    .deal-tickets-overlay { position: fixed; top: 0; left: 250px; right: 0; bottom: 0; background: #f8fafc; z-index: 1040; overflow-y: auto; }
    .deal-card { transition: transform 0.2s ease, box-shadow 0.2s ease; border-top: 4px solid transparent; }
    .deal-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.05) !important; }
    .btn-white { background: #fff; border: 1px solid #e2e8f0; }
    .kanban-wrapper { min-height: 500px; }
    .kanban-column { min-width: 280px; width: 280px; }
    .bg-soft-primary { background-color: #eef2ff; }
    .chat-overlay { position: fixed; top: 0; right: 0; width: 450px; height: 100vh; background: #fff; z-index: 1050; display: flex; flex-direction: column; }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    .fs-8 { font-size: 0.65rem; }
    .cdk-drag-preview {
      box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
                  0 8px 10px 1px rgba(0, 0, 0, 0.14),
                  0 3px 14px 2px rgba(0, 0, 0, 0.12);
    }
    .cdk-drag-placeholder { opacity: 0; }
    .cdk-drag-animating { transition: transform 250ms cubic-bezier(0, 0, 0.2, 1); }
    .kanban-list.cdk-drop-list-dragging .card:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class DealsComponent implements OnInit {
  activeTab: 'my-deals' | 'incoming' = 'my-deals';
  viewMode: 'list' | 'kanban' = 'kanban';
  deals: any[] = [];
  unassignedDeals: any[] = [];
  clients: User[] = [];
  showCreateForm = false;
  currentUserId: number | null = null;
  selectedDealChat: any = null;
  selectedDealTickets: any = null;
  dealTickets: any[] = [];
  showNewTicketForm = false;
  newTicket = { subject: '', description: '' };

  kanbanColumns = [
    { label: 'Proposition', statuses: ['PROPOSITION'], color: 'secondary' },
    { label: 'Négociation', statuses: ['NEGOTIATION', 'CLIENT_INITIATED', 'PENDING_CLIENT'], color: 'warning' },
    { label: 'En Validation Admin', statuses: ['PENDING_ADMIN'], color: 'info' },
    { label: 'Gagné / Projet', statuses: ['VALIDATED'], color: 'success' }
  ];

  getDealsByStatus(statuses: string[]) {
    return this.deals.filter(d => statuses.includes(d.status));
  }

  newDeal = {
    name: '',
    description: '',
    budget: null,
    clientId: null
  };

  constructor(
    private dealService: DealService,
    private adminService: AdminService,
    private authService: AuthService,
    private ticketService: TicketService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserId();
    this.loadAll();
    this.loadClients();
  }

  onDrop(event: CdkDragDrop<string>) {
    const deal = event.item.data;
    const newStatus = event.container.data;

    if (deal.status !== newStatus) {
      this.updateStatus(deal, newStatus);
    }
  }

  loadAll() {
    this.loadDeals();
    this.loadUnassigned();
  }

  loadDeals() {
    if (this.currentUserId) {
      if (this.authService.isCommercialLeader()) {
        this.dealService.getDealsForLeader().subscribe(res => {
          this.deals = res;
        });
      } else {
        this.dealService.getDealsByCommercial(this.currentUserId).subscribe(res => {
          this.deals = res;
        });
      }
    }
  }

  loadUnassigned() {
    this.dealService.getUnassignedDeals().subscribe(res => {
      this.unassignedDeals = res;
    });
  }

  assignToMe(deal: any) {
    if (this.currentUserId) {
      this.dealService.assignCommercial(deal.id, this.currentUserId).subscribe(() => {
        this.activeTab = 'my-deals';
        this.loadAll();
      });
    }
  }

  loadClients() {
    this.adminService.getUsersByRole('ROLE_CLIENT').subscribe(res => {
      this.clients = res;
    });
  }

  isFormValid() {
    return this.newDeal.name && this.newDeal.budget;
  }

  saveDeal() {
    if (this.currentUserId) {
      const payload: any = {
        ...this.newDeal,
        commercial: { id: this.currentUserId }
      };
      
      if (this.newDeal.clientId) {
        payload.client = { id: this.newDeal.clientId };
      }

      this.dealService.createDeal(payload).subscribe(() => {
        this.showCreateForm = false;
        this.newDeal = { name: '', description: '', budget: null, clientId: null };
        this.loadDeals();
      });
    }
  }

  updateStatus(deal: any, status: string) {
    this.dealService.updateStatus(deal.id, status).subscribe(() => {
      this.loadDeals();
    });
  }

  getStatusClass(status: string) {
    switch(status) {
      case 'PROPOSITION': return 'bg-light text-dark text-uppercase';
      case 'PENDING_CLIENT': return 'bg-soft-primary text-primary';
      case 'PENDING_ADMIN': return 'bg-soft-warning text-warning';
      case 'VALIDATED': return 'bg-soft-success text-success';
      case 'REJECTED': return 'bg-soft-danger text-danger';
      default: return 'bg-light';
    }
  }

  getStatusLabel(status: string) {
    switch(status) {
      case 'PROPOSITION': return 'Proposition';
      case 'CLIENT_INITIATED': return 'Nouveau (Initié par Client)';
      case 'NEGOTIATION': return 'En Négociation';
      case 'PENDING_CLIENT': return 'En attente Client';
      case 'PENDING_ADMIN': return 'Attente Validation Admin';
      case 'VALIDATED': return 'Validé / Projet';
      case 'REJECTED': return 'Refusé';
      default: return status;
    }
  }

  formatDuration(mins: number): string {
    if (!mins) return '0m';
    const d = Math.floor(mins / (60 * 24));
    const h = Math.floor((mins % (60 * 24)) / 60);
    const m = mins % 60;
    
    if (d > 0) return `${d}j ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }

  openTickets(deal: any) {
    this.selectedDealTickets = deal;
    this.loadDealTickets(deal.id);
  }

  loadDealTickets(dealId: number) {
    this.ticketService.getTicketsByDealId(dealId).subscribe(res => {
      this.dealTickets = res;
    });
  }

  saveTicket() {
    if (this.newTicket.subject && this.currentUserId && this.selectedDealTickets) {
      const ticketPayload: any = {
        subject: this.newTicket.subject,
        description: this.newTicket.description,
        type: 'SUPPORT',
        status: 'en cours',
        priority: 'MEDIUM',
        deal: { id: this.selectedDealTickets.id }
      };

      this.ticketService.createTicket(this.currentUserId, ticketPayload).subscribe(() => {
        this.showNewTicketForm = false;
        this.newTicket = { subject: '', description: '' };
        this.loadDealTickets(this.selectedDealTickets.id);
        this.loadDeals(); // Refresh count on cards
      });
    }
  }

  openChat(deal: any, ticketId?: number) {
    if (this.currentUserId) {
      if (ticketId) {
        // Mode chat ticket spécifique
        this.selectedDealChat = { ...deal, ticketId: ticketId };
      } else {
        // Mode chat workspace général
        this.dealService.ensureChat(deal.id, this.currentUserId).subscribe(res => {
          this.selectedDealChat = res;
        });
      }
    }
  }
}
