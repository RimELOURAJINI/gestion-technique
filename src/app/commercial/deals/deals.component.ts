import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DealService } from '../../services/deal.service';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/models';
import { DealNegotiationComponent } from '../../shared/deal-negotiation/deal-negotiation.component';

@Component({
  selector: 'app-commercial-deals',
  standalone: true,
  imports: [CommonModule, FormsModule, DealNegotiationComponent],
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
              <label class="form-label fw-medium fs-13">Client *</label>
              <select class="form-select" [(ngModel)]="newDeal.clientId">
                <option [ngValue]="null">-- Sélectionner un client --</option>
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
                <button *ngIf="deal.status === 'DRAFT'" class="btn btn-primary btn-sm" (click)="updateStatus(deal, 'PENDING_CLIENT')">
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
      <div class="kanban-wrapper overflow-auto" *ngIf="activeTab === 'my-deals' && viewMode === 'kanban'">
          <div class="d-flex gap-3 pb-3" style="min-width: 1200px;">
              <div class="kanban-column flex-fill" *ngFor="let col of kanbanColumns">
                  <div class="d-flex justify-content-between align-items-center mb-3 bg-light p-2 rounded-3">
                      <h6 class="fw-bold mb-0 fs-13 text-uppercase">{{ col.label }}</h6>
                      <span class="badge bg-white text-dark border shadow-sm">{{ getDealsByStatus(col.statuses).length }}</span>
                  </div>
                  <div class="kanban-list d-flex flex-column gap-3">
                      <div class="card border-0 shadow-sm border-start border-3" 
                           *ngFor="let deal of getDealsByStatus(col.statuses)"
                           [class.border-primary]="col.color === 'primary'"
                           [class.border-warning]="col.color === 'warning'"
                           [class.border-success]="col.color === 'success'">
                          <div class="card-body p-3">
                              <h6 class="fw-bold fs-14 mb-2">{{ deal.name }}</h6>
                              <div class="d-flex align-items-center mb-3">
                                  <div class="avatar-xs bg-light rounded-circle me-2 d-flex align-items-center justify-content-center fs-10">
                                      {{ deal.client?.firstName?.charAt(0) }}
                                  </div>
                                  <span class="text-muted fs-11">{{ deal.client?.firstName }} {{ deal.client?.lastName }}</span>
                              </div>
                              <div class="d-flex justify-content-between align-items-center">
                                  <span class="fw-bold fs-13">{{ deal.budget | number:'1.0-0' }} €</span>
                                  <button class="btn btn-icon btn-sm btn-soft-primary rounded-circle" (click)="openChat(deal)">
                                      <i class="ti ti-chevron-right"></i>
                                  </button>
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
    .deal-card { transition: transform 0.2s ease, box-shadow 0.2s ease; border-top: 4px solid transparent; }
    .deal-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.05) !important; }
    .btn-white { background: #fff; border: 1px solid #e2e8f0; }
    .kanban-wrapper { min-height: 500px; }
    .kanban-column { min-width: 280px; width: 280px; }
    .bg-soft-primary { background-color: #eef2ff; }
    .chat-overlay { position: fixed; top: 0; right: 0; width: 450px; height: 100vh; background: #fff; z-index: 1050; display: flex; flex-direction: column; }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
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

  kanbanColumns = [
    { label: 'Brouillon', statuses: ['DRAFT'], color: 'secondary' },
    { label: 'Proposition Envoyée', statuses: ['PENDING_CLIENT'], color: 'primary' },
    { label: 'Négociation', statuses: ['NEGOTIATION', 'CLIENT_INITIATED'], color: 'warning' },
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
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserId();
    this.loadAll();
    this.loadClients();
  }

  loadAll() {
    this.loadDeals();
    this.loadUnassigned();
  }

  loadDeals() {
    if (this.currentUserId) {
      if (this.authService.isCommercialLeader()) {
        this.dealService.getAllDeals().subscribe(res => {
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
    return this.newDeal.name && this.newDeal.clientId && this.newDeal.budget;
  }

  saveDeal() {
    if (this.currentUserId) {
      const payload = {
        ...this.newDeal,
        commercial: { id: this.currentUserId },
        client: { id: this.newDeal.clientId }
      };

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

  openChat(deal: any) {
    if (this.currentUserId) {
      this.dealService.ensureChat(deal.id, this.currentUserId).subscribe(res => {
        this.selectedDealChat = res;
      });
    }
  }

  getStatusClass(status: string) {
    switch(status) {
      case 'DRAFT': return 'bg-light text-dark text-uppercase';
      case 'PENDING_CLIENT': return 'bg-soft-primary text-primary';
      case 'PENDING_ADMIN': return 'bg-soft-warning text-warning';
      case 'VALIDATED': return 'bg-soft-success text-success';
      case 'REJECTED': return 'bg-soft-danger text-danger';
      default: return 'bg-light';
    }
  }

  getStatusLabel(status: string) {
    switch(status) {
      case 'DRAFT': return 'Brouillon';
      case 'CLIENT_INITIATED': return 'Nouveau (Initié par Client)';
      case 'NEGOTIATION': return 'En Négociation';
      case 'PENDING_CLIENT': return 'En attente Client';
      case 'PENDING_ADMIN': return 'Attente Validation Admin';
      case 'VALIDATED': return 'Validé / Projet';
      case 'REJECTED': return 'Refusé';
      default: return status;
    }
  }
}
