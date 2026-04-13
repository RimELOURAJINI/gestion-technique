import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';
import { Project, Ticket } from '../../models/models';
import { TicketChatComponent } from '../ticket-chat/ticket-chat.component';

@Component({
  selector: 'app-project-support-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TicketChatComponent],
  templateUrl: './project-support-modal.component.html',
  styleUrls: ['./project-support-modal.component.css']
})
export class ProjectSupportModalComponent implements OnInit {
  @Input() project: Project | null = null;
  @Output() onClose = new EventEmitter<void>();

  tickets: any[] = [];
  selectedTicketId: number | null = null;
  isLoading = true;
  currentUserId: number | null = null;
  showSupportModal = false;
  selectedProject: any = null;

  constructor(
    private ticketService: TicketService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserId();
    this.loadProjectTickets();
  }

  loadProjectTickets(): void {
    if (!this.project) return;
    this.isLoading = true;
    
    // We fetch all tickets and filter by project locally for now
    // as we don't have a direct /tickets/project/:id endpoint in TicketService yet.
    this.ticketService.getAllTickets().subscribe({
      next: (res) => {
        this.tickets = res.filter((t: any) => t.project?.id === this.project?.id);
        this.isLoading = false;
        
        // If there's only one ticket, select it automatically
        if (this.tickets.length === 1) {
          this.selectedTicketId = this.tickets[0].id;
        }
      },
      error: (err) => {
        console.error('Error loading tickets', err);
        this.isLoading = false;
      }
    });
  }

  selectTicket(ticket: any): void {
    this.selectedTicketId = ticket.id;
  }

  createNewTicket(): void {
    if (!this.project || !this.currentUserId) return;
    
    const subject = prompt('Sujet du ticket (ex: Problème de déploiement) :');
    if (!subject) return;

    const newTicket: any = {
      subject: subject,
      description: `Ticket de support ouvert pour le projet ${this.project.name}`,
      status: 'OPEN',
      priority: 'MEDIUM',
      type: 'TECHNICAL_SUPPORT',
      project: { id: this.project.id }
    };

    this.ticketService.createTicket(this.currentUserId, newTicket).subscribe({
      next: (res) => {
        this.tickets.unshift(res);
        this.selectedTicketId = res.id ?? null;
      },
      error: (err) => alert('Erreur lors de la création du ticket : ' + err.message)
    });
  }

  close(): void {
    this.onClose.emit();
  }

  getStatusBadge(status: string): string {
    switch(status?.toUpperCase()) {
      case 'OPEN': return 'bg-soft-primary text-primary';
      case 'IN_PROGRESS': return 'bg-soft-warning text-warning';
      case 'RESOLVED': return 'bg-soft-success text-success';
      case 'CLOSED': return 'bg-soft-secondary text-secondary';
      default: return 'bg-soft-light text-dark';
    }
  }
}
