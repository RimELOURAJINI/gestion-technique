import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';
import { TicketChatComponent } from '../../shared/ticket-chat/ticket-chat.component';
import { AdminService } from '../../services/admin.service';
import { PersonalPointageComponent } from '../../shared/personal-pointage/personal-pointage.component';

import { ProjectSupportModalComponent } from '../../shared/project-support-modal/project-support-modal.component';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-client-projects',
  standalone: true,
  imports: [CommonModule, TicketChatComponent, FormsModule, PersonalPointageComponent, ProjectSupportModalComponent, RouterModule],
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
          <div class="card border-0 shadow-sm h-100 card-hover clickable-card">
            <div class="card-body p-4">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div class="badge rounded-pill px-3" 
                     [ngClass]="{
                       'bg-soft-success text-success': project.status === 'Completed' || project.status === 'DONE' || project.status === 'TERMINE',
                       'bg-soft-primary text-primary': project.status === 'ACTIVE' || project.status === 'IN_PROGRESS',
                       'bg-soft-warning text-warning': project.status === 'NOT_STARTED' || project.status === 'TODO'
                     }">
                  {{ project.status }}
                </div>
                <div class="text-muted fs-11">Début: {{ project.startDate | date }}</div>
              </div>
              <h5 class="fw-bold mb-2 cursor-pointer" [routerLink]="['/client/projects', project.id]">{{ project.name }}</h5>
              <p class="text-muted fs-13 mb-4 line-clamp-2">{{ project.description }}</p>

              <div class="mb-4 cursor-pointer" [routerLink]="['/client/projects', project.id]">
                <div class="d-flex justify-content-between mb-2">
                  <span class="fs-12 text-muted">Avancement</span>
                  <span class="fs-12 fw-bold text-dark">{{ calculateProgress(project) }}%</span>
                </div>
                <div class="progress rounded-pill" style="height: 8px;">
                  <div class="progress-bar bg-gradient" 
                       [ngClass]="project.status === 'Completed' || project.status === 'DONE' ? 'bg-success' : 'bg-primary'"
                       role="progressbar" [style.width.%]="calculateProgress(project)"></div>
                </div>
              </div>

              <div class="row g-2 mb-4 fs-12 text-muted cursor-pointer" [routerLink]="['/client/projects', project.id]">
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
                <div class="d-flex align-items-center cursor-pointer" [routerLink]="['/client/projects', project.id]">
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
                  <div>
                    <span class="fw-bold fs-12 text-dark">Détails <i class="ti ti-chevron-right ms-1"></i></span>
                  </div>
                </div>
                <div class="d-flex gap-2">
                  <button class="btn btn-sm btn-primary rounded-pill px-3 fs-11 fw-bold d-flex align-items-center gap-1" (click)="openProjectSupport(project)">
                    <i class="ti ti-headset fs-14"></i> Tickets
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <app-project-support-modal *ngIf="showSupportModal" [project]="selectedProjectForSupport" (onClose)="showSupportModal = false"></app-project-support-modal>
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
  showSupportModal = false;

  constructor(
    private ticketService: TicketService,
    private authService: AuthService,
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit() {
    const userId = this.authService.getUserId();
    if (userId) {
      this.ticketService.getClientProjects(userId).subscribe({
        next: (data) => {
          this.projects = data;
        },
        error: (err) => {
          console.error("❌ Impossible de charger les projets!", err);
        }
      });
      this.adminService.getUsersByRole('COMMERCIAL').subscribe(data => {
        this.commercials = data;
      });
    }
  }

  viewDetails(project: any) {
    this.router.navigate(['/client/projects', project.id]);
  }

  openProjectSupport(project: any) {
    this.selectedProjectForSupport = project;
    this.showSupportModal = true;
  }

  closeSupport() {
    this.selectedProjectForSupport = null;
    this.projectTicketId = null;
    this.showSupportModal = false;
  }

  calculateProgress(project: any): number {
    return project.status === 'Completed' ? 100 : 65;
  }
}
