import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { Reclamation, Project } from '../../models/models';

@Component({
  selector: 'app-reclamations-hub',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="fw-bold mb-1">Hub de Réclamations</h3>
          <p class="text-muted">Gérez vos signalements et consultez les réponses officielles.</p>
        </div>
        <button *ngIf="!isAdmin" class="btn btn-primary shadow-sm" (click)="showCreateForm = !showCreateForm">
          <i class="ti ti-plus me-1"></i> {{ showCreateForm ? 'Fermer le formulaire' : 'Nouvelle Réclamation' }}
        </button>
      </div>

      <!-- Create Form -->
      <div class="card border-0 shadow-sm mb-4" *ngIf="showCreateForm && !isAdmin">
        <div class="card-body p-4">
          <h5 class="fw-bold mb-3">Créer un nouveau signalement</h5>
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label fw-medium">Sujet / Titre</label>
              <input type="text" class="form-control" [(ngModel)]="newReclam.title" placeholder="Ex: Problème technique, Retard...">
            </div>
            <div class="col-md-6">
              <label class="form-label fw-medium">Projet concerné</label>
              <select class="form-select" [(ngModel)]="selectedProjectId">
                <option [value]="null">Choisir un projet...</option>
                <option *ngFor="let p of myProjects" [value]="p.id">{{ p.name }}</option>
              </select>
            </div>
            <div class="col-md-4">
              <label class="form-label fw-medium">Type</label>
              <select class="form-select" [(ngModel)]="newReclam.type">
                <option value="TECHNIQUE">Technique</option>
                <option value="DELAI">Délai / Rallonge</option>
                <option value="RESSOURCES">Ressources</option>
                <option value="AUTRE">Autre</option>
              </select>
            </div>
            <div class="col-12">
              <label class="form-label fw-medium">Message détaillé</label>
              <textarea class="form-control" rows="3" [(ngModel)]="newReclam.message" placeholder="Décrivez votre problème ici..."></textarea>
            </div>
            <div class="col-12 text-end">
              <button class="btn btn-primary px-4" (click)="submitReclamation()" [disabled]="!isFormValid()">
                Envoyer le signalement
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- List -->
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white py-3 border-0">
          <h5 class="mb-0 fw-bold">
            {{ isAdmin ? 'Toutes les réclamations reçues' : 'Mes réclamations envoyées' }}
          </h5>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th>Titre / Sujet</th>
                <th>Projet</th>
                <th>{{ isAdmin ? 'Expéditeur' : 'Statut' }}</th>
                <th>Date</th>
                <th class="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="reclamations.length === 0">
                <td colspan="5" class="text-center py-5 text-muted">Aucune réclamation trouvée.</td>
              </tr>
              <tr *ngFor="let r of reclamations">
                <td>
                  <div class="fw-bold">{{ r.title }}</div>
                  <div class="small text-muted">{{ r.type }}</div>
                </td>
                <td>{{ r.project?.name || 'N/A' }}</td>
                <td>
                  <span *ngIf="!isAdmin" class="badge rounded-pill" [ngClass]="getStatusClass(r.status)">
                    {{ r.status }}
                  </span>
                  <div *ngIf="isAdmin" class="fw-medium">{{ r.sender?.firstName }} {{ r.sender?.lastName }}</div>
                </td>
                <td>{{ r.createdAt | date:'short' }}</td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-primary me-2" (click)="viewDetails(r)">
                    Détails
                  </button>
                  <button *ngIf="isAdmin && r.status === 'PENDING'" class="btn btn-sm btn-success" (click)="respond(r)">
                    Répondre
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Details Modal (Simple Overlay) -->
    <div class="modal-backdrop fade show" *ngIf="selectedReclam"></div>
    <div class="modal fade show d-block" *ngIf="selectedReclam">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow-lg">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">{{ selectedReclam.title }}</h5>
            <button type="button" class="btn-close" (click)="selectedReclam = null"></button>
          </div>
          <div class="modal-body p-4">
            <div class="row mb-4">
              <div class="col-md-6">
                <p class="mb-1 text-muted small text-uppercase">Statut</p>
                <span class="badge rounded-pill" [ngClass]="getStatusClass(selectedReclam.status)">{{ selectedReclam.status }}</span>
              </div>
              <div class="col-md-6 text-md-end">
                <p class="mb-1 text-muted small text-uppercase">Projet</p>
                <div class="fw-bold">{{ selectedReclam.project?.name || 'N/A' }}</div>
              </div>
            </div>
            
            <div class="mb-4">
              <p class="mb-1 text-muted small text-uppercase">Message de l'expéditeur</p>
              <div class="p-3 bg-light rounded-3">{{ selectedReclam.message }}</div>
            </div>

            <div class="mb-0" *ngIf="selectedReclam.response">
              <p class="mb-1 text-muted small text-uppercase">Réponse de l'administration</p>
              <div class="p-3 bg-soft-success text-success rounded-3 border border-success-subtle">
                {{ selectedReclam.response }}
              </div>
            </div>
            <div *ngIf="!selectedReclam.response" class="text-muted italic small">
              Aucune réponse pour le moment.
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="selectedReclam = null">Fermer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bg-soft-success { background-color: rgba(25, 135, 84, 0.1); }
    .italic { font-style: italic; }
  `]
})
export class ReclamationHubComponent implements OnInit {
  reclamations: Reclamation[] = [];
  myProjects: Project[] = [];
  isAdmin = false;
  showCreateForm = false;
  selectedReclam: Reclamation | null = null;
  
  newReclam: Partial<Reclamation> = {
    title: '',
    message: '',
    type: 'TECHNIQUE'
  };
  selectedProjectId: number | null = null;
  currentUserId: number | null = null;

  constructor(
    private employeeService: EmployeeService,
    private adminService: AdminService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUserId = this.authService.getUserId();
    const roles = this.authService.getUserRoles();
    this.isAdmin = roles.includes('ROLE_ADMIN');

    this.loadData();
  }

  loadData() {
    if (this.isAdmin) {
      this.adminService.getReclamations().subscribe(res => this.reclamations = res);
    } else if (this.currentUserId) {
      this.employeeService.getMyReclamations(this.currentUserId).subscribe(res => this.reclamations = res);
      this.employeeService.getMyProjects(this.currentUserId).subscribe(res => this.myProjects = res);
    }
  }

  isFormValid() {
    return this.newReclam.title?.trim() && this.newReclam.message?.trim() && this.selectedProjectId;
  }

  submitReclamation() {
    if (!this.isFormValid() || !this.currentUserId || !this.selectedProjectId) return;

    this.employeeService.createReclamation(this.newReclam as Reclamation, this.currentUserId, this.selectedProjectId).subscribe({
      next: (res) => {
        alert('Signalement envoyé avec succès !');
        this.reclamations.unshift(res);
        this.showCreateForm = false;
        this.newReclam = { title: '', message: '', type: 'TECHNIQUE' };
        this.selectedProjectId = null;
      },
      error: (err) => alert("Erreur lors de l'envoi du signalement.")
    });
  }

  viewDetails(r: Reclamation) {
    this.selectedReclam = r;
  }

  respond(r: Reclamation) {
    const response = prompt('Entrez votre réponse à ce signalement :');
    if (response === null) return;

    const status = confirm('Accepter cette réclamation ?') ? 'ACCEPTED' : 'REVIEWED';
    
    this.adminService.updateReclamationStatus(r.id!, status, response).subscribe({
      next: (updated) => {
        alert('Réponse envoyée !');
        r.status = updated.status;
        r.response = updated.response;
        if (this.selectedReclam?.id === r.id) this.selectedReclam = r;
      },
      error: (err) => alert('Erreur lors de la mise à jour.')
    });
  }

  getStatusClass(status: string | undefined): string {
    switch (status?.toUpperCase()) {
      case 'ACCEPTED': return 'bg-success';
      case 'PENDING': return 'bg-warning text-dark';
      case 'REVIEWED': return 'bg-info text-white';
      case 'REJECTED': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}
