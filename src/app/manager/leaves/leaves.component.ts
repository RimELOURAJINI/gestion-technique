import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HrService } from '../../services/hr.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-manager-leaves',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leaves.component.html',
  styleUrls: ['./leaves.component.css']
})
export class ManagerLeavesComponent implements OnInit {
  leaves: any[] = [];
  isLoading = true;
  managerId: number | null = null;
  filterStatus = 'ALL';

  constructor(
    private hrService: HrService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.managerId = this.authService.getUserId();
    this.loadLeaves();
  }

  loadLeaves(): void {
    if (!this.managerId) return;
    this.isLoading = true;
    
    this.hrService.getTeamLeaves(this.managerId).subscribe({
      next: (data) => {
        this.leaves = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading team leaves', err);
        this.isLoading = false;
      }
    });
  }

  get filteredLeaves() {
    if (this.filterStatus === 'ALL') return this.leaves;
    return this.leaves.filter(l => l.status === this.filterStatus);
  }

  processLeave(leaveId: number, status: string): void {
    if (!this.managerId) return;
    const feedback = prompt('Ajouter un commentaire (optionnel) :') || '';
    
    this.hrService.processLeave(leaveId, this.managerId, status, feedback).subscribe({
      next: () => {
        this.loadLeaves();
      },
      error: (err) => console.error('Error processing leave', err)
    });
  }

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'APPROVED': return 'badge bg-soft-success text-success';
      case 'REJECTED': return 'badge bg-soft-danger text-danger';
      case 'PENDING': return 'badge bg-soft-warning text-warning';
      default: return 'badge bg-soft-secondary text-secondary';
    }
  }

  getTypeLabel(type: string): string {
    switch (type?.toUpperCase()) {
      case 'ANNUAL': return 'Congé Annuel';
      case 'SICK': return 'Maladie';
      case 'UNPAID': return 'Sans Solde';
      default: return type || 'Autre';
    }
  }
}
