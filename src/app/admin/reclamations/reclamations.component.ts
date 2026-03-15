import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { Reclamation } from '../../models/models';

@Component({
  selector: 'app-reclamations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reclamations.component.html',
  styleUrl: './reclamations.component.css'
})
export class AdminReclamationsComponent implements OnInit {
  reclamations: Reclamation[] = [];
  isLoading = true;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadReclamations();
  }

  loadReclamations() {
    this.isLoading = true;
    this.adminService.getReclamations().subscribe({
      next: (res) => {
        this.reclamations = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading reclamations:', err);
        this.isLoading = false;
      }
    });
  }

  updateStatus(reclam: Reclamation, status: string) {
    if (reclam.id) {
      this.adminService.updateReclamationStatus(reclam.id, status).subscribe({
        next: () => {
          reclam.status = status;
          alert(`Statut de la réclamation mis à jour: ${status}`);
        },
        error: (err) => console.error('Error updating reclamation status:', err)
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'resolved': return 'bg-success';
      case 'reviewed': return 'bg-info';
      case 'pending': return 'bg-warning';
      default: return 'bg-secondary';
    }
  }
}
