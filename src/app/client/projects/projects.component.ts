import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-client-projects',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4">
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
                  <div class="team-avatars d-flex me-3">
                    <div *ngFor="let member of $any(project.team)?.users | slice:0:3" 
                         class="avatar-xs bg-soft-primary text-primary rounded-circle d-flex align-items-center justify-content-center border border-white" 
                         [title]="$any(member).firstName"
                         style="margin-left: -8px;">
                      {{ $any(member).firstName.charAt(0) }}
                    </div>
                    <div *ngIf="$any(project.team)?.users?.length > 3" class="avatar-xs bg-dark text-white rounded-circle d-flex align-items-center justify-content-center border border-white fs-10" style="margin-left: -8px;">
                      +{{ $any(project.team).users.length - 3 }}
                    </div>
                  </div>
                  <div>
                    <span class="text-muted fs-11 d-block">Équipe technique</span>
                    <span class="fw-bold fs-12 text-dark">{{ project.team?.name || 'Déploiement en cours' }}</span>
                  </div>
                </div>
                <button class="btn btn-sm btn-soft-primary rounded-pill px-3 fs-11 fw-bold">Détails</button>
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
    .card-hover { transition: transform 0.2s, box-shadow 0.2s; }
    .card-hover:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important; }
    .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  `]
})
export class ClientProjectsComponent implements OnInit {
  projects: any[] = [];

  constructor(
    private ticketService: TicketService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const clientId = this.authService.getUserId();
    if (clientId) {
      this.ticketService.getClientProjects(clientId).subscribe(data => {
        this.projects = data;
      });
    }
  }

  calculateProgress(project: any): number {
    // Logique simplifiée : peut être basée sur le budget ou des tâches (si disponibles)
    // Pour l'instant on retourne une valeur fixe ou calculée
    return project.status === 'Completed' ? 100 : 65;
  }
}
