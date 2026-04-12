import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';
import { TicketChatComponent } from '../../shared/ticket-chat/ticket-chat.component';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-client-projects',
  standalone: true,
  imports: [CommonModule, TicketChatComponent, FormsModule],
  template: `
    <div class="support-overlay" *ngIf="selectedProjectForSupport">
      <div class="support-modal shadow-lg rounded-4 overflow-hidden border">
        <div class="modal-header p-3 bg-dark text-white d-flex justify-content-between align-items-center">
          <h6 class="mb-0 fw-bold">Support Projet : {{ selectedProjectForSupport.name }}</h6>
          <button class="btn btn-sm btn-link text-white text-decoration-none" (click)="closeSupport()">
             Fermer <i class="ti ti-x ms-1"></i>
          </button>
        </div>
        <div class="modal-body p-0 d-flex flex-column flex-md-row" style="height: 600px;">
          <!-- Project Info Sidebar -->
          <div class="project-info p-3 bg-light border-end" style="width: 300px;">
             <div class="mb-4">
               <label class="text-muted fs-10 text-uppercase fw-bold d-block mb-1">Description</label>
               <p class="fs-12 text-dark">{{ selectedProjectForSupport.description }}</p>
             </div>
             <div class="mb-3">
               <label class="text-muted fs-10 text-uppercase fw-bold d-block mb-1">Budget Initial</label>
               <span class="badge bg-soft-success text-success fs-12">{{ selectedProjectForSupport.budget | number:'1.2-2' }} €</span>
             </div>
             <div class="mb-3" *ngIf="selectedProjectForSupport.commercial">
               <label class="text-muted fs-10 text-uppercase fw-bold d-block mb-1">Responsable Commercial</label>
               <div class="d-flex align-items-center">
                 <div class="avatar-xs bg-primary text-white rounded-circle me-2 d-flex align-items-center justify-content-center fs-10">
                   {{ selectedProjectForSupport.commercial.firstName.charAt(0) }}{{ selectedProjectForSupport.commercial.lastName.charAt(0) }}
                 </div>
                 <span class="fs-12">{{ selectedProjectForSupport.commercial.firstName }} {{ selectedProjectForSupport.commercial.lastName }}</span>
               </div>
             </div>
             <div class="mb-3">
               <label class="text-muted fs-10 text-uppercase fw-bold d-block mb-1">Équipes Techniques</label>
               <div *ngFor="let team of selectedProjectForSupport.teams" class="mb-1">
                 <span class="badge bg-soft-primary text-primary fs-11 w-100 text-start">{{ team.name }}</span>
               </div>
             </div>
          </div>
          <!-- Chat Area -->
           <div class="chat-area flex-grow-1 d-flex flex-column overflow-hidden">
             <div *ngIf="!projectTicketId" class="h-100 d-flex flex-column align-items-center justify-content-center p-4">
                <i class="ti ti-message-2 fs-1 text-muted mb-3"></i>
                <h6>Besoin d'aide ?</h6>
                <p class="text-muted text-center fs-12 mb-4">Ouvrez un ticket de support pour discuter avec l'équipe commerciale et technique.</p>
                
                <div class="w-100 px-4 mb-3">
                   <label class="fs-12 mb-1">Choisir un commercial :</label>
                   <select class="form-select form-select-sm" [(ngModel)]="selectedCommercialId">
                      <option [ngValue]="null">-- Sélectionner --</option>
                      <option *ngFor="let comm of commercials" [ngValue]="comm.id">{{ comm.firstName }} {{ comm.lastName }}</option>
                   </select>
                   <div *ngIf="commercials.length === 0" class="text-muted fs-11 mt-1"><i class="ti ti-info-circle me-1"></i>Aucun commercial disponible.</div>
                </div>

                <button class="btn btn-primary px-4 rounded-pill" 
                        [disabled]="!selectedCommercialId"
                        (click)="createProjectTicket()">
                  Commencer une discussion
                </button>
             </div>
             <app-ticket-chat *ngIf="projectTicketId" [ticketId]="projectTicketId" [showHeader]="false" class="flex-grow-1 d-flex flex-column overflow-hidden"></app-ticket-chat>
           </div>
        </div>
      </div>
    </div>

    <div class="p-4" [ngClass]="{'blur-content': selectedProjectForSupport}">
      <div class="row mb-4 align-items-center">
        <div class="col">
          <h4 class="fw-bold mb-0 text-dark">Mes Projets en Cours</h4>
          <p class="text-muted">Suivez l'avancement de vos projets et collaborez avec l'équipe.</p>
        </div>
      </div>

      <div class="row">
        <div *ngFor="let project of projects" class="col-md-6 col-lg-4 mb-4">
          <div class="card border-0 shadow-sm h-100 card-hover">
            <div class="card-body p-4">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div class="badge bg-soft-primary text-primary rounded-pill px-3">{{ project.status }}</div>
                <div class="text-muted fs-11">Début: {{ project.startDate | date }}</div>
              </div>
              <h5 class="fw-bold mb-2">{{ project.name }}</h5>
              <p class="text-muted fs-13 mb-4 line-clamp-2">{{ project.description }}</p>

              <div class="mb-4">
                <div class="d-flex justify-content-between mb-2">
                  <span class="fs-12 text-muted">Avancement</span>
                  <span class="fs-12 fw-bold text-dark">{{ calculateProgress(project) }}%</span>
                </div>
                <div class="progress rounded-pill" style="height: 8px;">
                  <div class="progress-bar bg-primary bg-gradient" 
                       role="progressbar" [style.width.%]="calculateProgress(project)"></div>
                </div>
              </div>

              <div class="row g-2 mb-4 fs-12 text-muted">
                <div class="col-6">
                  <span class="d-block mb-1">Budget Project</span>
                  <span class="fw-bold text-dark">{{ project.budget | number:'1.2-2' }} €</span>
                </div>
                <div class="col-6 text-end">
                  <span class="d-block mb-1">Consommé</span>
                  <span class="fw-bold text-danger">{{ project.spentBudget | number:'1.2-2' }} €</span>
                </div>
              </div>

              <div class="d-flex align-items-center justify-content-between p-3 bg-light rounded-3">
                <div class="d-flex align-items-center">
                  <div class="team-avatars d-flex me-3" *ngIf="project.teams && project.teams.length > 0">
                    <ng-container *ngFor="let team of $any(project).teams | slice:0:1">
                      <div *ngFor="let member of $any(team).users | slice:0:3" 
                           class="avatar-xs bg-soft-primary text-primary rounded-circle d-flex align-items-center justify-content-center border border-white" 
                           [title]="$any(member).firstName"
                           style="margin-left: -5px;">
                        {{ $any(member).firstName.charAt(0) }}
                      </div>
                    </ng-container>
                  </div>
                  <div class="avatar-xs bg-soft-secondary text-muted rounded-circle d-flex align-items-center justify-content-center border border-white me-3" *ngIf="!project.teams || project.teams.length === 0">
                    <i class="ti ti-users fs-10"></i>
                  </div>
                  <div>
                    <span class="text-muted fs-11 d-block">Équipes techniques</span>
                    <span class="fw-bold fs-12 text-dark" *ngIf="project.teams && project.teams.length > 0">
                      {{ project.teams[0].name }} <small *ngIf="project.teams.length > 1">(+{{ project.teams.length - 1 }})</small>
                    </span>
                    <span class="fw-bold fs-12 text-dark" *ngIf="!project.teams || project.teams.length === 0">Déploiement en cours</span>
                  </div>
                </div>
                <div class="d-flex gap-2">
                  <button class="btn btn-sm btn-soft-primary rounded-pill px-3 fs-11 fw-bold" (click)="viewDetails(project)">Détails</button>
                  <button class="btn btn-sm btn-primary rounded-pill px-3 fs-11 fw-bold d-flex align-items-center gap-1" (click)="openProjectSupport(project)">
                    <i class="ti ti-headset fs-14"></i> Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div *ngIf="projects.length === 0" class="col-12 text-center py-5">
          <div class="avatar-lg bg-light text-muted rounded-circle d-inline-flex align-items-center justify-content-center mb-3">
            <i class="ti ti-folder-off fs-1"></i>
          </div>
          <h5 class="text-muted">Aucun projet trouvé.</h5>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .support-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1050; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; }
    .support-modal { background: white; width: 92%; max-width: 1050px; height: 82vh; display: flex; flex-direction: column; border-radius: 16px; overflow: hidden; animation: modalIn 0.3s ease-out; }
    .support-modal .modal-header { flex-shrink: 0; }
    .support-modal .modal-body { flex: 1; overflow: hidden; min-height: 0; }
    .project-info { overflow-y: auto; flex-shrink: 0; }
    .chat-area { min-height: 0; }
    @keyframes modalIn { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
    .avatar-xs { width: 24px; height: 24px; font-size: 10px; }
  `]
})
export class ClientProjectsComponent implements OnInit {
  projects: any[] = [];
  selectedProjectForSupport: any = null;
  projectTicketId: number | null = null;
  commercials: any[] = [];
  selectedCommercialId: number | null = null;

  constructor(
    private ticketService: TicketService,
    private authService: AuthService,
    private adminService: AdminService
  ) {}

  ngOnInit() {
    const userId = this.authService.getUserId();
    if (userId) {
      this.ticketService.getClientProjects(userId).subscribe({
        next: (data) => {
          console.log("📂 Projets récupérés pour le client:", data);
          if (data && data.length === 0) {
            console.warn("⚠️ Attention: La liste des projets est vide pour l'ID " + userId);
          }
          this.projects = data;
        },
        error: (err) => {
          console.error("❌ ERREUR CRITIQUE: Impossible de charger les projets!", err);
          alert("Erreur de connexion au serveur lors du chargement des projets.");
        }
      });
      this.adminService.getUsersByRole('COMMERCIAL').subscribe(data => {
        this.commercials = data;
      });
    }
  }

  viewDetails(project: any) {
    // Peut rediriger ou montrer un modal plus détaillé
    alert(`Détails du projet: ${project.name}\nStatus: ${project.status}\nBudget: ${project.budget} €`);
  }

  openProjectSupport(project: any) {
    this.selectedProjectForSupport = project;
    this.selectedCommercialId = project.commercial?.id || null;
    
    // On vérifie si un ticket existe déjà pour ce projet via une convention de sujet par exemple
    // Ou mieux, on pourrait ajouter un champ projectTicketId dans l'entité Project
    // Ici on va chercher les tickets du client liés à ce projet
    const clientId = this.authService.getUserId();
    if (clientId) {
      this.ticketService.getClientTickets(clientId).subscribe(tickets => {
        const existingTicket = tickets.find(t => t.project?.id === project.id);
        if (existingTicket) {
          this.projectTicketId = existingTicket.id ?? null;
        } else {
          this.projectTicketId = null;
        }
      });
    }
  }

  closeSupport() {
    this.selectedProjectForSupport = null;
    this.projectTicketId = null;
  }

  createProjectTicket() {
    if (!this.selectedProjectForSupport || !this.selectedCommercialId) return;
    const userId = this.authService.getUserId();
    if (!userId) return;

    const payload: any = {
      subject: `Support: ${this.selectedProjectForSupport.name}`,
      description: `Demande de support technique/commercial pour le projet ${this.selectedProjectForSupport.name}`,
      type: 'SUPPORT',
      project: { id: this.selectedProjectForSupport.id }
    };

    this.ticketService.createTicket(userId, payload).subscribe(res => {
      this.projectTicketId = res.id ?? null;
      // Optionnel: envoyer un premier message ou assigner le commercial (le backend le fait via participants)
    });
  }

  calculateProgress(project: any): number {
    // Logique simplifiée : peut être basée sur le budget ou des tâches (si disponibles)
    // Pour l'instant on retourne une valeur fixe ou calculée
    return project.status === 'Completed' ? 100 : 65;
  }
}
