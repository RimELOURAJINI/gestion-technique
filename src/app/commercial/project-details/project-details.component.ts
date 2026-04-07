import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './project-details.component.html',
  styleUrl: './project-details.component.css'
})
export class ProjectDetailsComponent implements OnInit {
  project: any = null;
  isLoading = true;
  
  // Chat / Ticket properties
  messages: any[] = [];
  newMessage: string = '';
  selectedFiles: File[] = [];
  base64Images: string[] = [];
  ticketId: number | null = null;
  currentUserId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private adminService: AdminService,
    private authService: AuthService,
    private location: Location
  ) {}

  ngOnInit() {
    this.currentUserId = this.authService.getUserId();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProjectDetails(+id);
    }
  }

  loadProjectDetails(projectId: number) {
    this.adminService.getAllProjects().subscribe((projects: any[]) => {
      this.project = projects.find(p => p.id === projectId);
      this.isLoading = false;
      if (this.project) {
        this.checkOrCreateTicket();
      }
    });
  }

  checkOrCreateTicket() {
    // Vérifie s'il existe déjà un ticket de type COMMERCIAL_REQUEST pour ce projet
    // Pour simplifier, on fetcherait l'endpoint GET /tickets et on filtre.
    // L'agent doit le simuler comme on n'a pas rajouté d'endpoint custom for project_ticket search dans le backend (on a juste getAll).
    fetch('http://localhost:8080/api/tickets').then(res => res.json()).then((tickets: any[]) => {
      const activeTicket = tickets.find(t => t.project?.id === this.project.id && t.type === 'COMMERCIAL_REQUEST');
      if (activeTicket) {
        this.ticketId = activeTicket.id;
        this.loadMessages();
      } else {
        // Create new ticket if doesn't exist
        const payload = {
          subject: `Discussion Commerciale - ${this.project.name}`,
          description: "Fil de discussion initié par le commercial",
          type: "COMMERCIAL_REQUEST",
          priority: "Medium",
          status: "Open",
          project: { id: this.project.id }
        };
        if (this.currentUserId) {
          this.adminService.createTicket(this.currentUserId, payload).subscribe((res: any) => {
            this.ticketId = res.id;
            this.loadMessages();
          });
        }
      }
    });
  }

  loadMessages() {
    if (this.ticketId) {
      this.adminService.getTicketMessages(this.ticketId).subscribe(data => {
        this.messages = data;
        this.autoScrollChat();
      });
    }
  }

  autoScrollChat() {
    setTimeout(() => {
      const el = document.getElementById('chatContainer');
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }, 100);
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (files.length > 3) {
      alert("Vous ne pouvez sélectionner que 3 images maximum.");
      return;
    }
    this.selectedFiles = Array.from(files).slice(0, 3);
    this.base64Images = [];
    
    Array.from(this.selectedFiles).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.base64Images.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  sendMessage() {
    if (!this.newMessage.trim() && this.base64Images.length === 0) return;
    if (!this.ticketId || !this.currentUserId) return;

    this.adminService.addTicketMessage(this.ticketId, this.currentUserId, this.newMessage, this.base64Images).subscribe(() => {
      this.newMessage = '';
      this.selectedFiles = [];
      this.base64Images = [];
      // reset file input
      const fileInput = document.getElementById('chatImages') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      this.loadMessages();
    });
  }

  goBack() {
    this.location.back();
  }

  getStatusClass(status?: string): string {
    switch(status?.toLowerCase()) {
      case 'in progress': return 'bg-primary';
      case 'completed': return 'bg-success';
      case 'on hold': return 'bg-warning';
      case 'cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getTranslateStatus(status?: string): string {
    switch(status?.toLowerCase()) {
      case 'in progress': return 'En Cours';
      case 'completed': return 'Terminé';
      case 'on hold': return 'En Pause';
      case 'cancelled': return 'Annulé';
      default: return status || 'N/A';
    }
  }
}
