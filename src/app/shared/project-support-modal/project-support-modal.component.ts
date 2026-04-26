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
  historicalTickets: any[] = [];
  selectedTicketId: number | null = null;
  isLoading = true;
  currentUserId: number | null = null;
  isCreating = false;
  isValidating = false;

  // New Ticket Form
  newTicket = {
    title: '',
    subject: '',
    description: '',
    projectId: null as number | null,
    images: [] as string[]
  };
  myProjects: Project[] = [];

  // Validation Form
  validationData = {
    solution: '',
    correctedBy: ''
  };

  constructor(
    private ticketService: TicketService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserId();
    this.loadProjectTickets();
    this.loadMyProjects();
  }

  loadMyProjects(): void {
    if (!this.currentUserId) return;
    // Assuming we can get projects for the user role
    this.ticketService.getAllTickets().subscribe(() => {
      // Dummy call to get projects if needed, or use a specific project service
      // For now we use the input project if available
    });
    
    // In a real app, we'd call a project service
    // If we have an input project, we pre-select it
    if (this.project) {
      this.newTicket.projectId = this.project.id;
    }
  }

  loadProjectTickets(): void {
    if (!this.project && !this.task) return;
    this.isLoading = true;
    
    this.ticketService.getAllTickets().subscribe({
      next: (res) => {
        if (this.task) {
          this.tickets = res.filter((t: any) => t.task?.id === this.task?.id && t.status !== 'VALIDATED');
          this.historicalTickets = res.filter((t: any) => t.task?.id === this.task?.id && t.status === 'VALIDATED');
        } else if (this.project) {
          this.tickets = res.filter((t: any) => t.project?.id === this.project?.id && t.status !== 'VALIDATED');
          this.historicalTickets = res.filter((t: any) => t.project?.id === this.project?.id && t.status === 'VALIDATED');
        }
        this.isLoading = false;
        
        if (this.tickets.length === 1 && !this.selectedTicketId) {
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
    this.isCreating = false;
    this.isValidating = false;
  }

  getSelectedTicket(): any {
    return this.tickets.find(t => t.id === this.selectedTicketId) || this.historicalTickets.find(t => t.id === this.selectedTicketId);
  }

  isCreator(ticket: any): boolean {
    return ticket && ticket.createdBy && ticket.createdBy.id === this.currentUserId;
  }

  startValidation() {
    this.isValidating = true;
  }

  confirmValidation() {
    if (!this.selectedTicketId || !this.currentUserId) return;
    if (!this.validationData.solution || !this.validationData.correctedBy) {
      alert('Veuillez remplir tous les champs de validation.');
      return;
    }

    this.ticketService.validateTicket(
      this.selectedTicketId, 
      this.currentUserId, 
      this.validationData.solution, 
      this.validationData.correctedBy
    ).subscribe({
      next: (res) => {
        this.loadProjectTickets();
        this.isValidating = false;
        this.selectedTicketId = res.id ?? null;
      },
      error: (err: any) => alert('Erreur lors de la validation: ' + err.message)
    });
  }

  createNewTicketMode(): void {
    this.isCreating = true;
    this.selectedTicketId = null;
    this.newTicket = {
      title: '',
      subject: '',
      description: '',
      projectId: this.project?.id || null,
      images: []
    };
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files.length + this.newTicket.images.length > 3) {
      alert('Maximum 3 images autorisées.');
      return;
    }

    for (let file of files) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.newTicket.images.push(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(index: number) {
    this.newTicket.images.splice(index, 1);
  }

  submitNewTicket() {
    if (!this.currentUserId || !this.newTicket.title || !this.newTicket.subject) return;
    if (!this.newTicket.projectId && !this.task) {
      alert('Veuillez sélectionner un projet.');
      return;
    }

    const ticketToCreate: any = {
      title: this.newTicket.title,
      subject: this.newTicket.subject,
      description: this.newTicket.description || this.newTicket.subject,
      status: 'en cours',
      priority: 'MEDIUM',
      type: 'TECHNICAL_SUPPORT',
      imageUrl1: this.newTicket.images[0] || null,
      imageUrl2: this.newTicket.images[1] || null,
      imageUrl3: this.newTicket.images[2] || null
    };

    if (this.newTicket.projectId) {
      ticketToCreate.project = { id: this.newTicket.projectId };
    }
    if (this.task) {
      ticketToCreate.task = { id: this.task.id };
    }

    this.ticketService.createTicket(this.currentUserId, ticketToCreate).subscribe({
      next: (res) => {
        this.tickets.unshift(res);
        this.selectedTicketId = res.id ?? null;
        this.isCreating = false;
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
      case 'validé':
      case 'validated': return 'bg-soft-success text-success';
      case 'closed':
      case 'fermé': return 'bg-soft-secondary text-secondary';
      default: return 'bg-soft-light text-dark';
    }
  }
}
