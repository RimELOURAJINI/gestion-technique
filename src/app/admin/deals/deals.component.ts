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
                  <tr *ngFor="let deal of deals" class="clickable-row transition" (click)="openChat(deal)">
                    <td class="ps-4">
                      <div class="d-flex flex-column">
                        <div class="d-flex align-items-center gap-2">
                          <span class="fw-bold text-dark fs-14">{{ deal.name }}</span>
                          <span class="badge bg-soft-secondary text-muted fs-9 px-2" *ngIf="deal.statusDurations && deal.statusDurations[deal.status]" title="Durée dans ce statut">
                            <i class="ti ti-clock"></i> {{ formatDuration(deal.statusDurations[deal.status]) }}
                          </span>
                        </div>
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
                      <div *ngIf="deal.status === 'PENDING_ADMIN'" class="team-selection-area">
                        <div class="d-flex flex-wrap gap-1 mb-1" style="max-width: 250px;">
                          <div *ngFor="let team of teams" 
                               (click)="toggleTeam(deal, team.id)"
                               class="badge team-badge pointer transition"
                               [class.bg-primary]="isTeamSelected(deal, team.id)"
                               [class.bg-soft-secondary]="!isTeamSelected(deal, team.id)"
                               [class.text-dark]="!isTeamSelected(deal, team.id)">
                            {{ team.name }}
                          </div>
                        </div>
                        <small class="text-muted fs-10 d-block" *ngIf="!deal.selectedTeamIds?.length">Sélectionnez les équipes</small>
                      </div>
                      <div *ngIf="deal.status === 'VALIDATED'" class="fs-12 text-success fw-medium">
                         <i class="ti ti-users me-1"></i> Équipes assignées
                      </div>
                    </td>
                    <td class="text-end pe-4">
                      <div class="d-flex justify-content-end gap-2 align-items-center">
                        <button class="btn btn-sm btn-soft-primary px-3 d-flex align-items-center gap-1" (click)="openChat(deal)">
                          <i class="ti ti-messages fs-16"></i> Négociation
                        </button>
                        
                        <ng-container *ngIf="deal.status === 'PENDING_ADMIN'">
                          <button class="btn btn-sm btn-success px-3 d-flex align-items-center gap-1" 
                                  [disabled]="!deal.selectedTeamIds || deal.selectedTeamIds.length === 0"
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
    .team-badge { cursor: pointer; padding: 6px 10px; font-weight: 500; font-size: 10px; border-radius: 6px; }
    .bg-soft-secondary { background-color: #f1f5f9; color: #475569; }
    .pointer { cursor: pointer; }
    .transition { transition: all 0.2s ease-in-out; }
    .team-badge:hover { transform: scale(1.05); }
    .clickable-row { cursor: pointer; }
    .clickable-row:hover { background-color: #f8fafc; }
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
      this.deals = res.map((d: any) => ({...d, selectedTeamIds: []}))
                      .sort((a:any, b:any) => b.id - a.id);
    });
  }

  loadTeams() {
    this.adminService.getAllTeams().subscribe((res: any) => {
      this.teams = res.teams ? res.teams : res;
    });
  }

  isTeamSelected(deal: any, teamId: number): boolean {
    return deal.selectedTeamIds && deal.selectedTeamIds.includes(teamId);
  }

  toggleTeam(deal: any, teamId: number) {
    if (!deal.selectedTeamIds) {
      deal.selectedTeamIds = [];
    }
    const index = deal.selectedTeamIds.indexOf(teamId);
    if (index > -1) {
      deal.selectedTeamIds.splice(index, 1);
    } else {
      deal.selectedTeamIds.push(teamId);
    }
  }

  validateDeal(deal: any) {
    if (!deal.selectedTeamIds || deal.selectedTeamIds.length === 0) {
      alert("Veuillez sélectionner au moins une équipe technique dans le tableau avant de valider et créer le projet.");
      return;
    }
    
    if (confirm(`Confirmer la validation du deal "${deal.name}" avec les équipes sélectionnées ? Cela créera officiellement le projet.`)) {
      this.dealService.updateStatus(deal.id, 'VALIDATED', deal.selectedTeamIds).subscribe({
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
      case 'PROPOSITION': return 'Proposition';
      case 'CLIENT_INITIATED': return 'Initié (Client)';
      case 'NEGOTIATION': return 'En Négociation';
      case 'PENDING_ADMIN': return 'À Valider';
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
}
