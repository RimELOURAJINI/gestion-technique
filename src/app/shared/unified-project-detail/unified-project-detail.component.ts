import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { Project } from '../../models/models';
import { ProjectSupportModalComponent } from '../project-support-modal/project-support-modal.component';

@Component({
  selector: 'app-unified-project-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ProjectSupportModalComponent],
  templateUrl: './unified-project-detail.component.html',
  styleUrls: ['./unified-project-detail.component.css']
})
export class UnifiedProjectDetailComponent implements OnInit {
  project: Project | null = null;
  isLoading = true;
  showSupportModal = false;
  
  timeProgress = 0;
  budgetProgress = 0;
  daysRemaining = 0;

  constructor(
    private route: ActivatedRoute,
    private adminService: AdminService,
    private authService: AuthService,
    private location: Location
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProjectDetails(+id);
    }
  }

  loadProjectDetails(id: number): void {
    this.isLoading = true;
    this.adminService.getProjectById(id).subscribe({
      next: (res) => {
        this.project = res;
        this.calculateProgress();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading project details', err);
        this.isLoading = false;
      }
    });
  }

  calculateProgress(): void {
    if (!this.project) return;

    // Time Progress
    const start = this.project.startDate ? new Date(this.project.startDate).getTime() : 0;
    const end = this.project.expectedEndDate ? new Date(this.project.expectedEndDate).getTime() : 0;
    const now = new Date().getTime();

    if (now >= end) {
      this.timeProgress = 100;
      this.daysRemaining = 0;
    } else if (now <= start) {
      this.timeProgress = 0;
      this.daysRemaining = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    } else {
      const total = end - start;
      const elapsed = now - start;
      this.timeProgress = Math.round((elapsed / total) * 100);
      this.daysRemaining = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    }

    // Budget Progress
    if (this.project.budget && this.project.spentBudget) {
      this.budgetProgress = Math.round((this.project.spentBudget / this.project.budget) * 100);
    } else {
      this.budgetProgress = 0;
    }
  }

  goBack(): void {
    this.location.back();
  }

  openSupport(): void {
    this.showSupportModal = true;
  }

  getStatusBadgeClass(status?: string): string {
    switch(status?.toUpperCase()) {
      case 'ACTIVE': return 'bg-soft-success text-success border-success';
      case 'COMPLETED': return 'bg-success text-white';
      case 'ON_HOLD': return 'bg-soft-warning text-warning border-warning';
      case 'CANCELLED': return 'bg-soft-danger text-danger border-danger';
      default: return 'bg-soft-secondary text-secondary';
    }
  }

  getOtherMembers(): any[] {
    if (!this.project || !this.project.involvedUsers) return [];
    
    const teamUserIds = new Set();
    this.project.teams?.forEach(team => {
      team.users?.forEach(user => teamUserIds.add(user.id));
    });

    return this.project.involvedUsers.filter(user => !teamUserIds.has(user.id));
  }
}
