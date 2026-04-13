import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HrService } from '../../services/hr.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-employee-leaves',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leaves.component.html',
  styleUrls: ['./leaves.component.css']
})
export class EmployeeLeavesComponent implements OnInit {
  leaves: any[] = [];
  isLoading = true;
  userId: number | null = null;
  
  newLeave = {
    startDate: '',
    endDate: '',
    type: 'ANNUAL',
    reason: ''
  };

  constructor(
    private hrService: HrService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    if (this.userId) {
      this.loadMyLeaves();
    }
  }

  loadMyLeaves(): void {
    if (!this.userId) return;
    this.isLoading = true;
    this.hrService.getMyLeaves(this.userId).subscribe({
      next: (data) => {
        this.leaves = data.sort((a,b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading leaves', err);
        this.isLoading = false;
      }
    });
  }

  submitRequest(): void {
    if (!this.userId) return;
    if (!this.newLeave.startDate || !this.newLeave.endDate) {
        alert('Veuillez remplir les dates.');
        return;
    }

    this.hrService.requestLeave(this.userId, this.newLeave).subscribe({
      next: () => {
        this.loadMyLeaves();
        this.newLeave = { startDate: '', endDate: '', type: 'ANNUAL', reason: '' };
        // Close modal logic if used, or just clear form
      },
      error: (err) => alert('Erreur lors de la demande : ' + err.message)
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
