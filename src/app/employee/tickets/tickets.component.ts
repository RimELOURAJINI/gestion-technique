import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { Ticket, Project } from '../../models/models';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tickets.component.html',
  styleUrl: './tickets.component.css'
})
export class TicketsComponent implements OnInit {
  tickets: Ticket[] = [];
  projects: Project[] = [];
  
  newTicket: Ticket = {
    subject: '',
    description: '',
    status: 'OPEN',
    priority: 'MEDIUM'
  };

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
      this.employeeService.getMyTickets(userId).subscribe(
        res => this.tickets = res,
        (err: any) => console.error('Error loading tickets', err)
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
    if (userId && this.newTicket.subject && this.newTicket.description) {
      this.employeeService.createTicket(this.newTicket, userId).subscribe(
        () => {
          alert('Ticket envoyé avec succès !');
          this.newTicket = { subject: '', description: '', status: 'OPEN', priority: 'MEDIUM' };
          this.showCreateForm = false;
          this.loadTickets();
        },
        (err: any) => console.error('Error creating ticket', err)
      );
    }
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
  }
}
