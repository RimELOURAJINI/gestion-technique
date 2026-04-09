import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DealService } from '../../services/deal.service';
import { AuthService } from '../../services/auth.service';
import { TicketChatComponent } from '../ticket-chat/ticket-chat.component';

@Component({
  selector: 'app-deal-negotiation',
  standalone: true,
  imports: [CommonModule, FormsModule, TicketChatComponent],
  template: `
    <div class="negotiation-wrapper bg-soft-light min-vh-100 p-4">
      <div class="container-fluid">
        <!-- Top Bar -->
        <div class="d-flex justify-content-between align-items-center mb-1 pb-3">
          <div class="d-flex align-items-center">
            <button class="btn btn-soft-secondary me-3" (click)="onClose.emit()">
              <i class="ti ti-arrow-left fs-20"></i>
            </button>
            <div>
              <h3 class="mb-0 fw-bold text-dark">{{ deal?.name }}</h3>
              <p class="mb-0 text-muted small">Négociation #{{ deal?.id }} • Créé le {{ deal?.createdAt | date:'shortDate' }}</p>
            </div>
          </div>
          
          <div class="d-flex align-items-center gap-3">
            <!-- Action Commercial : Visible si en phase de négociation (Étape 1) -->
            <button *ngIf="isCommercial && (deal?.status === 'NEGOTIATION' || deal?.status === 'CLIENT_INITIATED' || deal?.status === 'PENDING_CLIENT' || deal?.status === 'DRAFT')" 
                    class="btn btn-primary d-flex align-items-center gap-2 px-4 shadow-sm"
                    (click)="submitToAdmin()">
              <i class="ti ti-send fs-18"></i> Transmettre à l'Admin
            </button>

            <!-- Action Admin : Visible si en attente de validation (Étape 2) -->
            <button *ngIf="isAdmin && deal?.status === 'PENDING_ADMIN'" 
                    class="btn btn-success d-flex align-items-center gap-2 px-4 shadow-sm" 
                    (click)="onValidate.emit(deal)">
              <i class="ti ti-check fs-18"></i> Valider & Créer Projet
            </button>

            <span class="badge rounded-pill px-3 py-2 fs-11 text-uppercase" [ngClass]="getStatusClass(deal?.status)">
              {{ getStatusLabel(deal?.status) }}
            </span>
          </div>
        </div>

        <!-- Workflow Stepper -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
              <div class="card-body p-0">
                <div class="d-flex workflow-steps">
                  <div class="step flex-grow-1 p-3 text-center border-bottom border-4" [ngClass]="getStepClass(1)">
                    <div class="fs-11 text-uppercase fw-bold mb-1 opacity-75">Étape 1</div>
                    <div class="fw-bold fs-13">Négociation (Commercial)</div>
                  </div>
                  <div class="step flex-grow-1 p-3 text-center border-bottom border-4" [ngClass]="getStepClass(2)">
                    <div class="fs-11 text-uppercase fw-bold mb-1 opacity-75">Étape 2</div>
                    <div class="fw-bold fs-13">Validation Administrative</div>
                  </div>
                  <div class="step flex-grow-1 p-3 text-center border-bottom border-4" [ngClass]="getStepClass(3)">
                    <div class="fs-11 text-uppercase fw-bold mb-1 opacity-75">Étape 3</div>
                    <div class="fw-bold fs-13">Projet Officiel</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row g-4">
          <!-- Left Content: Details -->
          <div class="col-lg-8">
            <!-- Details Card -->
            <div class="card border-0 shadow-sm rounded-4 mb-4">
              <div class="card-body p-4">
                <h5 class="fw-bold mb-4 d-flex align-items-center">
                  <i class="ti ti-info-circle me-2 text-primary"></i> Synthèse de la demande
                </h5>
                <div class="row g-4">
                  <div class="col-md-6 text-center border-end">
                    <label class="text-muted fs-11 text-uppercase fw-bold mb-1 d-block">Budget Conventionné</label>
                    <div class="d-flex align-items-baseline justify-content-center">
                      <h1 class="mb-0 fw-bold text-dark">{{ deal?.budget | number:'1.2-2' }}</h1>
                      <span class="ms-1 fw-bold text-dark fs-20">€</span>
                    </div>
                  </div>
                  <div class="col-md-6 text-center">
                    <label class="text-muted fs-11 text-uppercase fw-bold mb-1 d-block">Référent Commercial</label>
                    <div class="fw-bold fs-16 text-dark mt-2">
                       {{ deal?.commercial?.firstName || 'Discussion en cours...' }} {{ deal?.commercial?.lastName || '' }}
                    </div>
                  </div>
                  <div class="col-12 mt-2">
                    <div class="p-3 bg-light rounded-3 fs-14 text-dark border-start border-primary border-4 text-break">
                      <label class="text-muted fs-10 text-uppercase fw-bold mb-1 d-block">Description des besoins :</label>
                      {{ deal?.description || "Aucune description détaillée n'a été fournie." }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Participants Card -->
            <div class="card border-0 shadow-sm rounded-4">
              <div class="card-body p-4">
                <h5 class="fw-bold mb-4 d-flex align-items-center">
                  <i class="ti ti-users me-2 text-primary"></i> Parties Prenantes au workspace
                </h5>
                <div class="d-flex flex-wrap gap-4">
                  <!-- Client -->
                  <div class="participant-card d-flex align-items-center">
                    <div class="avatar-md bg-soft-primary text-primary rounded-circle me-3 d-flex align-items-center justify-content-center">
                      <i class="ti ti-user fs-24"></i>
                    </div>
                    <div>
                      <span class="badge bg-soft-primary text-primary fs-8 text-uppercase mb-1">Client</span>
                      <h6 class="mb-0 fw-bold">{{ deal?.client?.firstName }} {{ deal?.client?.lastName }}</h6>
                      <small class="text-muted fs-11">{{ deal?.client?.email }}</small>
                    </div>
                  </div>
                  <!-- Commercial -->
                  <div class="participant-card d-flex align-items-center">
                    <div class="avatar-md bg-soft-warning text-warning rounded-circle me-3 d-flex align-items-center justify-content-center">
                      <i class="ti ti-briefcase fs-24"></i>
                    </div>
                    <div>
                      <span class="badge bg-soft-warning text-warning fs-8 text-uppercase mb-1">Commercial</span>
                      <h6 class="mb-0 fw-bold">{{ deal?.commercial?.firstName || 'Attente...' }}</h6>
                      <small class="text-muted fs-11">{{ deal?.commercial?.email || 'Négociateur à assigner' }}</small>
                    </div>
                  </div>
                  <!-- Admin (Always supervising) -->
                  <div class="participant-card d-flex align-items-center">
                    <div class="avatar-md bg-soft-danger text-danger rounded-circle me-3 d-flex align-items-center justify-content-center">
                      <i class="ti ti-shield-check fs-24"></i>
                    </div>
                    <div>
                      <span class="badge bg-soft-danger text-danger fs-8 text-uppercase mb-1">Admin</span>
                      <h6 class="mb-0 fw-bold">Modérateur</h6>
                      <small class="text-muted fs-11">Validation finale</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Content: Chat -->
          <div class="col-lg-4">
            <div class="chat-section position-sticky" style="top: 20px;">
              <app-ticket-chat *ngIf="deal?.ticketId" [ticketId]="deal.ticketId" [onClose]="handleChatClose"></app-ticket-chat>
              <div *ngIf="!deal?.ticketId" class="card border-0 shadow-sm rounded-4 p-5 text-center bg-white h-100 d-flex flex-column justify-content-center">
                <i class="ti ti-message-off fs-40 text-muted mb-3"></i>
                <p class="text-muted">Chat en cours d'initialisation...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .negotiation-wrapper { overflow-x: hidden; }
    .bg-soft-light { background-color: #f4f7fa; }
    .btn-soft-secondary { background-color: #ffffff; color: #475569; border: 1px solid #e2e8f0; }
    .btn-soft-secondary:hover { background-color: #f8fafc; }
    .avatar-md { width: 44px; height: 44px; }
    .fs-8 { font-size: 0.6rem; }
    .fs-11 { font-size: 0.75rem; }
    .fs-13 { font-size: 0.8125rem; }
    .fs-16 { font-size: 1rem; }
    .fs-20 { font-size: 1.25rem; }
    .fs-24 { font-size: 1.5rem; }
    .fs-40 { font-size: 2.5rem; }
    .bg-soft-primary { background-color: #e0f2fe; color: #0369a1; }
    .bg-soft-warning { background-color: #fefce8; color: #a16207; }
    .bg-soft-danger { background-color: #fee2e2; color: #991b1b; }
    .bg-soft-success { background-color: #dcfce7; color: #166534; }
    .chat-section { height: calc(100vh - 180px); }
    
    .workflow-steps .step { border-bottom-color: #e2e8f0; color: #94a3b8; }
    .workflow-steps .step.active { border-bottom-color: #0d6efd; color: #0d6efd; background-color: #f8fbff; }
    .workflow-steps .step.completed { border-bottom-color: #198754; color: #198754; }

    :host ::ng-deep .chat-container { max-width: 100% !important; height: 100% !important; border-radius: 20px; border: none !important; box-shadow: none !important; }
  `]
})
export class DealNegotiationComponent implements OnInit {
  @Input() deal: any;
  @Input() isAdmin: boolean = false;
  @Input() isCommercial: boolean = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onValidate = new EventEmitter<any>();

  constructor(
    private dealService: DealService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.isAdmin) this.isAdmin = this.authService.isAdmin();
    if (!this.isCommercial) this.isCommercial = this.authService.isCommercial();

    if (this.deal && this.deal.id) {
       this.refreshDeal();
    }
  }

  refreshDeal() {
    this.dealService.getDealById(this.deal.id).subscribe(res => {
      this.deal = res;
      // S'assurer de passer en NEGOTIATION si le commercial ouvre le workspace
      const startStatuses = ['CLIENT_INITIATED', 'PENDING_CLIENT', 'DRAFT'];
      if (this.isCommercial && startStatuses.includes(this.deal.status)) {
        this.updateStatus('NEGOTIATION');
      }
    });
  }

  submitToAdmin() {
    const msg = "Avez-vous finalisé la discussion avec le client ? Cet accord sera soumis à l'admin pour création officielle du projet.";
    if (confirm(msg)) {
      this.updateStatus("PENDING_ADMIN");
    }
  }

  updateStatus(status: string) {
    this.dealService.updateStatus(this.deal.id, status).subscribe(() => {
      this.refreshDeal();
    });
  }

  handleChatClose = () => {
    this.onClose.emit();
  }

  getStepClass(stepNum: number) {
    const status = this.deal?.status;
    const isStep1Statuses = ['CLIENT_INITIATED', 'NEGOTIATION', 'PENDING_CLIENT', 'DRAFT'];
    
    if (stepNum === 1) {
      if (isStep1Statuses.includes(status)) return 'active';
      return 'completed';
    }
    if (stepNum === 2) {
      if (status === 'PENDING_ADMIN') return 'active';
      if (status === 'VALIDATED') return 'completed';
      return '';
    }
    if (stepNum === 3) {
      if (status === 'VALIDATED') return 'active';
      return '';
    }
    return '';
  }

  getStatusClass(status: string) {
    switch(status) {
      case 'DRAFT':
      case 'CLIENT_INITIATED':
      case 'PENDING_CLIENT':
      case 'NEGOTIATION': return 'bg-soft-primary text-primary';
      case 'PENDING_ADMIN': return 'bg-soft-warning text-warning';
      case 'VALIDATED': return 'bg-soft-success text-success';
      case 'REJECTED': return 'bg-soft-danger text-danger';
      default: return 'bg-light';
    }
  }

  getStatusLabel(status: string) {
    switch(status) {
      case 'DRAFT': return 'Brouillon';
      case 'CLIENT_INITIATED': return 'Négociation Initiée';
      case 'PENDING_CLIENT': return 'En attente Client';
      case 'NEGOTIATION': return 'Discussion en cours';
      case 'PENDING_ADMIN': return 'Attente Validation Admin';
      case 'VALIDATED': return 'Accord Validé ✅';
      case 'REJECTED': return 'Refusé';
      default: return status;
    }
  }
}
