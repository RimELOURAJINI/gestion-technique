import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';
import { Project, Task, Ticket } from '../../models/models';
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
  @Input() task: Task | null = null;
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
    if (!this.project && !this.task) return;
    this.isLoading = true;
    
    // We fetch all tickets and filter locally for now
    this.ticketService.getAllTickets().subscribe({
      next: (res) => {
        if (this.task) {
          this.tickets = res.filter((t: any) => t.task?.id === this.task?.id && t.status !== 'VALIDATED');
        } else if (this.project) {
          this.tickets = res.filter((t: any) => t.project?.id === this.project?.id && t.status !== 'VALIDATED');
        }
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

  getSelectedTicket(): any {
    return this.tickets.find(t => t.id === this.selectedTicketId);
  }

  isCreator(ticket: any): boolean {
    return ticket && ticket.createdBy && ticket.createdBy.id === this.currentUserId;
  }

  validateTicket(ticketId: number) {
    if (!ticketId || !this.currentUserId) return;
    if (!confirm('Voulez-vous vraiment valider ce ticket comme résolu ?')) return;

    this.ticketService.validateTicket(ticketId, this.currentUserId).subscribe({
      next: (res) => {
        // filter out if we want to hide it
        this.tickets = this.tickets.filter((t: any) => t.id !== ticketId);
        if (this.selectedTicketId === ticketId) {
          this.selectedTicketId = null;
        }
      },
      error: (err: any) => alert('Erreur lors de la validation: ' + err.message)
    });
  }

  createNewTicket(): void {
    if ((!this.project && !this.task) || !this.currentUserId) return;
    
    const subject = prompt('Sujet du ticket (ex: Problème de déploiement) :');
    if (!subject) return;

    let targetName = this.task ? this.task.title : this.project?.name;
    const newTicket: any = {
      subject: subject,
      description: `Ticket de support ouvert pour ${this.task ? 'la tâche' : 'le projet'} : ${targetName}`,
      status: 'en cours',
      priority: 'MEDIUM',
      type: 'TECHNICAL_SUPPORT'
    };

    if (this.project) {
      newTicket.project = { id: this.project.id };
    }
    if (this.task) {
      newTicket.task = { id: this.task.id };
    }

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
    switch(status?.toLowerCase()) {
      case 'open':
      case 'en cours': return 'bg-soft-primary text-primary';
      case 'in_progress':
      case 'en attente': return 'bg-soft-warning text-warning';
      case 'resolved':
      case 'validé': return 'bg-soft-success text-success';
      case 'closed':
      case 'fermé': return 'bg-soft-secondary text-secondary';
      default: return 'bg-soft-light text-dark';
    }
  }
}
