import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { Reclamation } from '../../models/models';
import { TicketChatComponent } from '../../shared/ticket-chat/ticket-chat.component';

@Component({
  selector: 'app-reclamations',
  standalone: true,
  imports: [CommonModule, FormsModule, TicketChatComponent],
  templateUrl: './reclamations.component.html',
  styleUrl: './reclamations.component.css'
})
export class AdminReclamationsComponent implements OnInit {
  reclamations: Reclamation[] = [];
  isLoading = true;
  activeTab: 'reclamations' | 'commercial' = 'reclamations';

  // Commercial Chat
  commercialTickets: any[] = [];
  selectedCommercialTicket: any = null;
  commercialMessages: any[] = [];
  newCommercialMessage: string = '';
  base64Images: string[] = [];
  currentUserId: number | null = null;

  constructor(
    private adminService: AdminService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUserId = this.authService.getUserId();
    this.loadReclamations();
    this.loadCommercialTickets();
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

  // COMMERCIAL TICKETS LOGIC
  loadCommercialTickets() {
    // Admin sees all commercial tickets
    this.adminService.getAllTickets().subscribe({
      next: (allTickets: any[]) => {
        this.commercialTickets = allTickets.filter(t => t.type === 'COMMERCIAL_REQUEST');
      },
      error: (err) => {
        console.error('Error loading commercial tickets:', err);
      }
    });
  }

  openCommercialChat(ticket: any) {
    this.selectedCommercialTicket = ticket;
    this.loadCommercialMessages();
  }

  loadCommercialMessages() {
    if (this.selectedCommercialTicket) {
      this.adminService.getTicketMessages(this.selectedCommercialTicket.id).subscribe(messages => {
        this.commercialMessages = messages;
        this.autoScrollChat();
      });
    }
  }

  autoScrollChat() {
    setTimeout(() => {
      const el = document.getElementById('adminCommercialChatContainer');
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

    this.adminService.addTicketMessage(this.selectedCommercialTicket.id, this.currentUserId, this.newCommercialMessage, this.base64Images).subscribe(() => {
      this.newCommercialMessage = '';
      this.base64Images = [];
      const fileInput = document.getElementById('chatImagesAdmin') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      this.loadCommercialMessages();
    });
  }

  closeCommercialChat() {
    this.selectedCommercialTicket = null;
    this.commercialMessages = [];
  }

  updateStatus(reclam: Reclamation, status: string) {
    if (reclam.id) {
      const response = prompt(`Entrez un message de feedback pour le statut ${status} (optionnel) :`);
      if (response === null && status === 'REJECTED') return;
      
      this.adminService.updateReclamationStatus(reclam.id, status, response || '').subscribe({
        next: () => {
          reclam.status = status as 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'REVIEWED';
          reclam.response = response || '';
          alert(`Statut de la réclamation mis à jour: ${status}`);
        },
        error: (err) => console.error('Error updating reclamation status:', err)
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'ACCEPTED': return 'bg-success';
      case 'REVIEWED': return 'bg-info';
      case 'PENDING': return 'bg-warning';
      case 'REJECTED': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}
