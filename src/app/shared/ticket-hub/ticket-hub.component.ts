import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';
import { Ticket } from '../../models/models';
import { TicketChatComponent } from '../ticket-chat/ticket-chat.component';

@Component({
  selector: 'app-ticket-hub',
  standalone: true,
  imports: [CommonModule, FormsModule, TicketChatComponent],
  templateUrl: './ticket-hub.component.html',
  styleUrl: './ticket-hub.component.css'
})
export class TicketHubComponent implements OnInit, OnChanges {
  @Input() mode: 'admin' | 'commercial' | 'manager' | 'employee' | 'client' = 'client';
  initialTicketId: number | null = null;
  initialProjectId: number | null = null;

  tickets: Ticket[] = [];
  filteredTickets: Ticket[] = [];
  selectedTicket: Ticket | null = null;
  searchTerm: string = '';
  isLoading = true;
  userId: number | null = null;

  constructor(
    private ticketService: TicketService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.userId = this.authService.getUserId();
    
    // Check for ticketId or projectId in query params
    this.route.queryParams.subscribe(params => {
        if (params['ticketId']) {
            this.initialTicketId = +params['ticketId'];
        }
        if (params['projectId']) {
            this.initialProjectId = +params['projectId'];
        }
    });

    this.loadTickets();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialTicketId'] && this.initialTicketId) {
      this.selectTicketById(this.initialTicketId);
    }
  }

  loadTickets() {
    if (!this.userId) return;
    this.isLoading = true;

    let obs;
    switch (this.mode) {
      case 'admin':
        obs = this.ticketService.getAllTickets();
        break;
      case 'commercial':
        obs = this.ticketService.getTicketsByCommercial(this.userId);
        break;
      case 'manager':
        obs = this.ticketService.getTicketsByManager(this.userId);
        break;
      case 'employee':
        obs = this.ticketService.getTicketsByEmployee(this.userId);
        break;
      default:
        obs = this.ticketService.getTicketsByUserId(this.userId);
    }

    obs.subscribe({
      next: (res) => {
        this.tickets = res.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
        this.filteredTickets = [...this.tickets];
        this.isLoading = false;
        
        if (this.initialTicketId) {
            this.selectTicketById(this.initialTicketId);
        } else if (this.initialProjectId) {
            const projectTicket = this.tickets.find(t => t.project?.id === this.initialProjectId);
            if (projectTicket) {
                this.selectTicket(projectTicket);
            } else if (this.tickets.length > 0) {
                this.selectTicket(this.tickets[0]);
            }
        } else if (this.tickets.length > 0 && !this.selectedTicket) {
          this.selectTicket(this.tickets[0]);
        }
      },
      error: () => this.isLoading = false
    });
  }

  filterTickets() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredTickets = [...this.tickets];
    } else {
      this.filteredTickets = this.tickets.filter(t => 
        t.subject.toLowerCase().includes(term) || 
        t.project?.name.toLowerCase().includes(term) ||
        t.createdBy?.firstName.toLowerCase().includes(term)
      );
    }
  }

  selectTicket(ticket: Ticket) {
    this.selectedTicket = ticket;
  }

  selectTicketById(id: number) {
      const ticket = this.tickets.find(t => t.id === id);
      if (ticket) {
          this.selectedTicket = ticket;
      }
  }

  getStatusClass(status?: string): string {
    switch (status?.toUpperCase()) {
      case 'OPEN': return 'bg-soft-success text-success';
      case 'IN_PROGRESS': return 'bg-soft-warning text-warning';
      case 'RESOLVED': return 'bg-soft-info text-info';
      case 'CLOSED': return 'bg-soft-secondary text-secondary';
      default: return 'bg-soft-primary text-primary';
    }
  }

  getPriorityClass(priority?: string): string {
    switch (priority?.toUpperCase()) {
      case 'URGENT': return 'bg-danger text-white px-2';
      case 'HIGH': return 'bg-soft-danger text-danger border border-danger p-1 px-2';
      case 'MEDIUM': return 'bg-soft-warning text-warning border border-warning p-1 px-2';
      case 'LOW': return 'bg-soft-info text-info border border-info p-1 px-2';
      default: return 'bg-soft-secondary text-secondary p-1 px-2';
    }
  }

  getPriorityLabel(priority?: string): string {
    switch (priority?.toUpperCase()) {
      case 'URGENT': return 'Urgente';
      case 'HIGH': return 'Élevée';
      case 'MEDIUM': return 'Moyenne';
      case 'LOW': return 'Faible';
      default: return priority || 'Basse';
    }
  }
}
