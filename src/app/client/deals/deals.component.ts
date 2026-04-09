import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DealService } from '../../services/deal.service';
import { AuthService } from '../../services/auth.service';
import { TicketChatComponent } from '../../shared/ticket-chat/ticket-chat.component';
import { DealNegotiationComponent } from '../../shared/deal-negotiation/deal-negotiation.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-client-deals',
  standalone: true,
  imports: [CommonModule, TicketChatComponent, FormsModule, DealNegotiationComponent],
  template: `
    <div class="p-4" *ngIf="!selectedDealChat">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 class="fw-bold text-dark mb-1">Mes Propositions de Projets</h4>
          <p class="text-muted small">Consultez et validez les propositions commerciales envoyées par nos équipes.</p>
        </div>
        <button class="btn btn-primary d-flex align-items-center gap-2" (click)="showCreateForm = !showCreateForm">
          <i class="ti" [ngClass]="showCreateForm ? 'ti-x' : 'ti-plus'"></i>
          {{ showCreateForm ? 'Annuler' : 'Demander un Projet' }}
        </button>
      </div>

      <!-- Formulaire de création -->
      <div class="card border-0 shadow-sm mb-4" *ngIf="showCreateForm" style="animation: slideDown 0.3s ease-out;">
        <div class="card-body p-4">
          <h6 class="fw-bold mb-3">Soumettre un besoin projet</h6>
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-medium fs-13">Nom du Projet *</label>
              <input type="text" class="form-control" [(ngModel)]="newDeal.name" placeholder="Ex: Refonte Site E-commerce">
            </div>
            <div class="col-md-6">
              <label class="form-label fw-medium fs-13">Budget Estimé (€) *</label>
              <div class="input-group">
                <span class="input-group-text bg-light border-end-0">€</span>
                <input type="number" class="form-control" [(ngModel)]="newDeal.budget" placeholder="0.00">
              </div>
            </div>
            <div class="col-md-12">
              <label class="form-label fw-medium fs-13">Description & Besoins</label>
              <textarea class="form-control" rows="3" [(ngModel)]="newDeal.description" placeholder="Décrivez ce que vous souhaitez réaliser..."></textarea>
            </div>
            <div class="col-md-12 text-end mt-4">
              <button class="btn btn-primary px-4" (click)="saveDeal()" [disabled]="!isFormValid()">
                Envoyer la Demande
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-xl-4 col-md-6" *ngFor="let deal of deals">
          <div class="card border-0 shadow-sm h-100 position-relative overflow-hidden">
            <div class="position-absolute top-0 start-0 w-100" style="height: 4px;" [ngClass]="deal.status === 'PENDING_CLIENT' ? 'bg-primary' : (deal.status === 'VALIDATED' ? 'bg-success' : 'bg-warning')"></div>
            
            <div class="card-body p-4 mt-1">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="badge rounded-pill px-3 py-1 fs-10 fw-bold text-uppercase" [ngClass]="getStatusClass(deal.status)">
                  {{ getStatusLabel(deal.status) }}
                </span>
                <span class="text-muted fs-11">{{ deal.createdAt | date:'mediumDate' }}</span>
              </div>

              <h5 class="fw-bold text-dark mb-3">{{ deal.name }}</h5>
              <p class="text-muted fs-13 mb-4" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; min-height: 3.6rem;">
                {{ deal.description || 'Projet de développement technique via EducaNet.' }}
              </p>

              <div class="bg-light p-3 rounded-3 mb-4 d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                   <div class="avatar-xs bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2 fs-10">
                      <i class="ti ti-currency-euro"></i>
                   </div>
                   <span class="fs-12 text-muted fw-medium">Budget Conventionné</span>
                </div>
                <span class="fs-15 fw-bold text-dark">{{ deal.budget | number:'1.2-2' }} €</span>
              </div>

              <div class="d-flex align-items-center mb-4 text-muted fs-12">
                <i class="ti ti-user-check me-2 text-primary"></i>
                {{ deal.commercial ? (deal.commercial.firstName + ' ' + deal.commercial.lastName) : 'Assignation en cours...' }}
              </div>

              <div class="d-grid gap-2 shadow-sm">
                <button *ngIf="deal.status === 'PENDING_CLIENT'" class="btn btn-primary d-flex align-items-center justify-content-center gap-2 py-2" (click)="acceptDeal(deal)">
                  <i class="ti ti-check fs-16"></i> Accepter la Proposition
                </button>
                <button class="btn btn-outline-primary d-flex align-items-center justify-content-center gap-2 py-2" (click)="openChat(deal)">
                  <i class="ti ti-messages fs-16"></i> Négocier & Discuter
                </button>
                <div *ngIf="deal.status === 'PENDING_ADMIN'" class="alert alert-soft-warning py-2 mb-0 fs-12 text-center border-0">
                  <i class="ti ti-clock me-1"></i> Attente validation finale Admin
                </div>
                <div *ngIf="deal.status === 'VALIDATED'" class="alert alert-soft-success py-2 mb-0 fs-12 text-center border-0">
                  <i class="ti ti-circle-check me-1"></i> Projet Validé
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="deals.length === 0" class="text-center py-5 mt-5">
        <div class="bg-light rounded-circle p-4 d-inline-block mb-3">
          <i class="ti ti-help fs-1 text-muted opacity-50"></i>
        </div>
        <h5 class="text-muted fw-bold">Aucune proposition en attente.</h5>
        <p class="text-muted small">Vos futures propositions de projets s'afficheront ici.</p>
      </div>
    </div>

    <!-- Negotiation Interface (Full Screen) -->
    <app-deal-negotiation 
      *ngIf="selectedDealChat" 
      [deal]="selectedDealChat" 
      [isAdmin]="false"
      (onClose)="selectedDealChat = null"
      (onValidate)="handleValidation($event)">
    </app-deal-negotiation>
  `,
  styles: [`
    .alert-soft-warning { background-color: #fffbeb; color: #92400e; }
    .alert-soft-success { background-color: #f0fdf4; color: #166534; }
    .fs-15 { font-size: 0.9375rem; }
    @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
  `]
})
export class DealsComponent implements OnInit {
  deals: any[] = [];
  currentUserId: number | null = null;
  selectedDealChat: any = null;
  showCreateForm = false;

  newDeal = {
    name: '',
    description: '',
    budget: null
  };

  constructor(
    private dealService: DealService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserId();
    this.loadDeals();
  }

  loadDeals() {
    if (this.currentUserId) {
      this.dealService.getDealsByClient(this.currentUserId).subscribe(res => {
        this.deals = res;
      });
    }
  }

  isFormValid() {
    return this.newDeal.name && this.newDeal.budget;
  }

  saveDeal() {
    console.log('🔵 Tentative de création de deal:', this.newDeal);
    if (this.currentUserId) {
      const payload = {
        ...this.newDeal,
        client: { id: this.currentUserId },
        commercial: null,
        status: 'CLIENT_INITIATED'
      };

      console.log('📤 Envoi du payload:', payload);
      this.dealService.createDeal(payload).subscribe({
        next: (res) => {
          console.log('✅ Deal créé avec succès:', res);
          this.showCreateForm = false;
          this.newDeal = { name: '', description: '', budget: null };
          this.loadDeals();
        },
        error: (err) => {
          console.error('🔴 Erreur complète:', err);
          let errorMsg = 'Détails non disponibles';
          
          if (err.error && typeof err.error === 'object' && err.error.message) {
            errorMsg = err.error.message;
          } else if (typeof err.error === 'string') {
            errorMsg = err.error;
          }
          
          alert('Une erreur est survenue lors de l\'envoi de la demande.\n\nDescription: ' + errorMsg);
        }
      });
    } else {
      console.warn('⚠️ Aucun ID utilisateur trouvé pour le client.');
    }
  }

  acceptDeal(deal: any) {
    this.dealService.updateStatus(deal.id, 'PENDING_ADMIN').subscribe(() => {
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
      case 'PENDING_CLIENT': return 'bg-soft-primary text-primary';
      case 'PENDING_ADMIN': return 'bg-soft-warning text-warning';
      case 'VALIDATED': return 'bg-soft-success text-success';
      case 'REJECTED': return 'bg-soft-danger text-danger';
      default: return 'bg-light';
    }
  }

  getStatusLabel(status: string) {
    switch(status) {
      case 'PENDING_CLIENT': return 'À Valider';
      case 'PENDING_ADMIN': return 'Validation Admin';
      case 'VALIDATED': return 'Validé';
      case 'REJECTED': return 'Refusé';
      default: return status;
    }
  }

  handleValidation(deal: any) {
    // Le client ne peut pas valider lui-même (seul l'admin le peut), 
    // mais on garde cette méthode pour la cohérence avec le composant partagé.
    console.log('Client attempt to validate (read-only):', deal);
  }
}
