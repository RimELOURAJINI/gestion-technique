import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DealService } from '../../services/deal.service';
import { AdminService } from '../../services/admin.service';
import { DealNegotiationComponent } from '../../shared/deal-negotiation/deal-negotiation.component';

@Component({
  selector: 'app-admin-deals',
  standalone: true,
  imports: [CommonModule, FormsModule, DealNegotiationComponent],
  template: `
    <div class="p-4" *ngIf="!selectedDealChat">
      <div class="mb-4">
        <h4 class="fw-bold text-dark mb-1">Validation Administrative des Deals</h4>
        <p class="text-muted small">Validez les propositions commerciales acceptées par les clients et assignez une équipe technique.</p>
      </div>

      <div class="row">
        <div class="col-12">
          <div class="card border-0 shadow-sm overflow-hidden">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="bg-light">
                  <tr>
                    <th class="ps-4 border-0 fs-11 text-uppercase fw-bold text-muted">Projet / Deal</th>
                    <th class="border-0 fs-11 text-uppercase fw-bold text-muted">Auteurs</th>
                    <th class="border-0 fs-11 text-uppercase fw-bold text-muted">Statut</th>
                    <th class="border-0 fs-11 text-uppercase fw-bold text-muted">Équipe Assignée</th>
                    <th class="border-0 fs-11 text-uppercase fw-bold text-muted text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let deal of deals">
                    <td class="ps-4">
                      <div class="d-flex flex-column">
                        <span class="fw-bold text-dark fs-14">{{ deal.name }}</span>
                        <small class="text-muted fs-11">Budget: {{ deal.budget | number:'1.2-2' }} €</small>
                      </div>
                    </td>
                    <td>
                      <div class="d-flex flex-column">
                        <span class="fs-12">Client: {{ deal.client?.firstName }}</span>
                        <span class="fs-12">Commercial: {{ deal.commercial?.firstName }}</span>
                      </div>
                    </td>
                    <td>
                      <span class="badge rounded-pill px-2 py-1 fs-9 fw-bold text-uppercase" [ngClass]="getStatusClass(deal.status)">
                        {{ getStatusLabel(deal.status) }}
                      </span>
                    </td>
                    <td>
                      <div *ngIf="deal.status === 'PENDING_ADMIN'">
                        <select class="form-select form-select-sm fs-12 border-primary" [(ngModel)]="deal.selectedTeamId" style="width: 180px;">
                          <option [ngValue]="null">-- Choisir Équipe --</option>
                          <option *ngFor="let team of teams" [ngValue]="team.id">{{ team.name }}</option>
                        </select>
                      </div>
                      <div *ngIf="deal.status === 'VALIDATED'" class="fs-12 text-muted">
                         <i class="ti ti-users me-1"></i> Équipe assignée lors de la validation
                      </div>
                    </td>
                    <td class="text-end pe-4">
                      <div class="d-flex justify-content-end gap-2 align-items-center">
                        <button class="btn btn-sm btn-soft-primary px-3 d-flex align-items-center gap-1" (click)="openChat(deal)">
                          <i class="ti ti-messages fs-16"></i> Négociation
                        </button>
                        
                        <ng-container *ngIf="deal.status === 'PENDING_ADMIN'">
                          <button class="btn btn-sm btn-success px-3 d-flex align-items-center gap-1" 
                                  [disabled]="!deal.selectedTeamId"
                                  (click)="validateDeal(deal)">
                            <i class="ti ti-check fs-14"></i> Valider
                          </button>
                        </ng-container>
                        
                        <div *ngIf="deal.status === 'VALIDATED'" class="text-success fs-12 fw-bold">
                          <i class="ti ti-circle-check fs-18"></i>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="deals.length === 0">
                    <td colspan="5" class="text-center py-5 text-muted">
                       Aucun deal à traiter pour le moment.
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
      [isAdmin]="true"
      (onClose)="selectedDealChat = null"
      (onValidate)="validateDeal($event)">
    </app-deal-negotiation>
  `,
  styles: [`
    .fs-9 { font-size: 0.65rem; }
    .fs-11 { font-size: 0.6875rem; }
    .fs-14 { font-size: 0.875rem; }
    .btn-soft-primary { background-color: #e0f2fe; color: #0369a1; border: none; }
  `]
})
export class DealsComponent implements OnInit {
  deals: any[] = [];
  teams: any[] = [];
  selectedDealChat: any = null;

  constructor(
    private dealService: DealService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.loadDeals();
    this.loadTeams();
  }

  loadDeals() {
    this.dealService.getAllDeals().subscribe(res => {
      this.deals = res.map((d: any) => ({...d, selectedTeamId: null}))
                      .sort((a:any, b:any) => b.id - a.id);
    });
  }

  loadTeams() {
    this.adminService.getAllTeams().subscribe((res: any) => {
      this.teams = res.teams ? res.teams : res;
    });
  }

  validateDeal(deal: any) {
    if (!deal.selectedTeamId) {
      alert("Veuillez sélectionner une équipe technique dans le tableau avant de valider et créer le projet.");
      return;
    }
    
    if (confirm(`Confirmer la validation du deal "${deal.name}" avec l'équipe sélectionnée ? Cela créera officiellement le projet.`)) {
      this.dealService.updateStatus(deal.id, 'VALIDATED', deal.selectedTeamId).subscribe({
        next: () => {
          this.loadDeals();
          if (this.selectedDealChat?.id === deal.id) {
            this.selectedDealChat = null;
          }
        },
        error: (err) => {
          console.error("Erreur API lors de la validation:", err);
          alert("Erreur lors de la validation. Vérifiez la console du navigateur.");
        }
      });
    }
  }

  updateStatus(deal: any, status: string) {
    this.dealService.updateStatus(deal.id, status).subscribe(() => {
      this.loadDeals();
    });
  }

  openChat(deal: any) {
    this.selectedDealChat = deal;
    // Si pas de ticketId, on pourrait l'initialiser ici aussi si nécessaire
  }

  getStatusClass(status: string) {
    switch(status) {
      case 'CLIENT_INITIATED': return 'bg-soft-primary text-primary';
      case 'NEGOTIATION': return 'bg-soft-primary text-primary';
      case 'PENDING_ADMIN': return 'bg-soft-warning text-warning';
      case 'VALIDATED': return 'bg-soft-success text-success';
      case 'REJECTED': return 'bg-soft-danger text-danger';
      default: return 'bg-light';
    }
  }

  getStatusLabel(status: string) {
    switch(status) {
      case 'CLIENT_INITIATED': return 'Initié (Client)';
      case 'NEGOTIATION': return 'En Négociation';
      case 'PENDING_ADMIN': return 'À Valider';
      case 'VALIDATED': return 'Validé / Projet';
      case 'REJECTED': return 'Refusé';
      default: return status;
    }
  }
}
