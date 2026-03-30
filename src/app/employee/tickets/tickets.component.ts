import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { Reclamation, Project } from '../../models/models';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tickets.component.html',
  styleUrl: './tickets.component.css'
})
export class TicketsComponent implements OnInit {
  reclamations: Reclamation[] = [];
  projects: Project[] = [];
  
  newReclamation: Reclamation = {
    title: '',
    message: '',
    status: 'PENDING'
  };
  selectedProjectId?: number;

  showCreateForm: boolean = false;

  constructor(
    private employeeService: EmployeeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadTickets();
    this.loadProjects();
  }

  loadTickets(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.employeeService.getMyReclamations(userId).subscribe(
        res => this.reclamations = res,
        (err: any) => console.error('Error loading reclamations', err)
      );
    }
  }

  loadProjects(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.employeeService.getMyProjects(userId).subscribe(
        res => this.projects = res,
        (err: any) => console.error('Error loading projects', err)
      );
    }
  }

  submitTicket(): void {
    const userId = this.authService.getUserId();
    if (userId && this.selectedProjectId && this.newReclamation.title && this.newReclamation.message) {
      this.employeeService.createReclamation(this.newReclamation, userId, +this.selectedProjectId).subscribe(
        () => {
          alert('Réclamation envoyée avec succès !');
          this.newReclamation = { title: '', message: '', status: 'PENDING' };
          this.selectedProjectId = undefined;
          this.showCreateForm = false;
          this.loadTickets();
        },
        (err: any) => {
          console.error('Error creating reclamation:', err);
          if (err.status === 500) {
            console.error('SERVER ERROR (500): Check for circular references or DB constraints.');
          }
          alert('Erreur lors de l\'envoi de la réclamation. ' + (err.error?.message || 'Vérifiez les logs console.'));
        }
      );
    } else if (!this.selectedProjectId) {
      alert('Veuillez sélectionner un projet.');
    }
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
  }
}
