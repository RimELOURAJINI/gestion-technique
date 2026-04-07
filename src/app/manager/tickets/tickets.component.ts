import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TeamLeaderService } from '../../services/manager.service';
import { AuthService } from '../../services/auth.service';
import { Reclamation, Project } from '../../models/models';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './tickets.component.html',
  styleUrl: './tickets.component.css'
})
export class TicketsComponent implements OnInit {
  reclamations: Reclamation[] = [];
  projects: Project[] = [];
  isLoading = true;
  activeTab: 'received' | 'send' | 'commercial' = 'received';

  // Send reclamation to admin
  newReclamation: Reclamation = { message: '', title: '' };
  selectedProjectId?: number;

  // Commercial Chat
  commercialTickets: any[] = [];
  selectedCommercialTicket: any = null;
  commercialMessages: any[] = [];
  newCommercialMessage: string = '';
  base64Images: string[] = [];
  currentUserId: number | null = null;
  fileInputValid: boolean = true;

  constructor(
    private teamLeaderService: TeamLeaderService,
    public authService: AuthService
  ) { }

  ngOnInit() {
    this.currentUserId = this.authService.getUserId();
    if (this.currentUserId) {
      this.teamLeaderService.getProjectsByUserId(this.currentUserId).subscribe(res => {
        this.projects = res;
        this.loadAllReclamations();
        this.loadCommercialTickets();
      });
    }
  }

  loadAllReclamations() {
    this.isLoading = true;
    this.reclamations = [];
    if (this.projects.length === 0) { this.isLoading = false; return; }
    let loaded = 0;
    this.projects.forEach(p => {
      if (p.id) {
        this.teamLeaderService.getReclamationsByProjectId(p.id).subscribe(res => {
          this.reclamations = [...this.reclamations, ...res];
          loaded++;
          if (loaded === this.projects.length) this.isLoading = false;
        });
      }
    });
  }

  // COMMERCIAL TICKETS LOGIC
  loadCommercialTickets() {
    this.teamLeaderService.getTickets().subscribe(allTickets => {
      // Filter tickets type COMMERCIAL_REQUEST where the project maps to the manager's projects
      const managerProjectIds = this.projects.map(p => p.id);
      this.commercialTickets = allTickets.filter(t => t.type === 'COMMERCIAL_REQUEST' && t.project?.id && managerProjectIds.includes(t.project.id));
    });
  }

  openCommercialChat(ticket: any) {
    this.selectedCommercialTicket = ticket;
    this.loadCommercialMessages();
  }

  loadCommercialMessages() {
    if (this.selectedCommercialTicket) {
      this.teamLeaderService.getTicketMessages(this.selectedCommercialTicket.id).subscribe(messages => {
        this.commercialMessages = messages;
        this.autoScrollChat();
      });
    }
  }

  autoScrollChat() {
    setTimeout(() => {
      const el = document.getElementById('commercialChatContainer');
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
    const selectedFiles = Array.from(files).slice(0, 3);
    this.base64Images = [];
    
    selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.base64Images.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  sendCommercialMessage() {
    if (!this.newCommercialMessage.trim() && this.base64Images.length === 0) return;
    if (!this.selectedCommercialTicket || !this.currentUserId) return;

    this.teamLeaderService.addTicketMessage(this.selectedCommercialTicket.id, this.currentUserId, this.newCommercialMessage, this.base64Images).subscribe(() => {
      this.newCommercialMessage = '';
      this.base64Images = [];
      const fileInput = document.getElementById('chatImagesManager') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      this.loadCommercialMessages();
    });
  }

  closeCommercialChat() {
    this.selectedCommercialTicket = null;
    this.commercialMessages = [];
  }

  sendReclamationToAdmin() {
    if (this.currentUserId && this.selectedProjectId && this.newReclamation.message) {
      this.teamLeaderService.sendReclamation(this.currentUserId, +this.selectedProjectId, this.newReclamation).subscribe({
        next: () => {
          alert('Réclamation envoyée à l\'administrateur.');
          this.newReclamation = { message: '', title: '' };
          this.selectedProjectId = undefined;
        },
        error: (err) => console.error(err)
      });
    }
  }

  acceptReclamation(id?: number) {
    if (!id) return;
    const response = prompt("Expliquez pourquoi vous acceptez cette réclamation (optionnel) :");
    this.teamLeaderService.updateReclamationStatus(id, 'ACCEPTED', response || '').subscribe({
        next: () => this.loadAllReclamations(),
        error: (err) => console.error(err)
    });
  }

  rejectReclamation(id?: number) {
    if (!id) return;
    const response = prompt("Expliquez pourquoi vous rejetez cette réclamation :");
    if (response === null) return;
    this.teamLeaderService.updateReclamationStatus(id, 'REJECTED', response || '').subscribe({
        next: () => this.loadAllReclamations(),
        error: (err) => console.error(err)
    });
  }

  getStatusClass(status?: string): string {
    switch (status?.toUpperCase()) {
        case 'ACCEPTED': return 'bg-success';
        case 'REJECTED': return 'bg-danger';
        case 'REVIEWED': return 'bg-info';
        case 'PENDING': return 'bg-warning';
        case 'OPEN': return 'bg-primary';
        case 'CLOSED': return 'bg-secondary';
        default: return 'bg-secondary';
    }
  }

  get pendingReclamations() {
    return this.reclamations.filter(r => (!r.status || r.status.toUpperCase() === 'PENDING') && r.sender?.id !== this.currentUserId);
  }

  get resolvedReclamations() {
    return this.reclamations.filter(r => (r.status && r.status.toUpperCase() !== 'PENDING') && r.sender?.id !== this.currentUserId);
  }

  get mySentReclamations() {
    return this.reclamations.filter(r => r.sender?.id === this.currentUserId);
  }
}
