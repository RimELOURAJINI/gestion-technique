import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-ticket-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-container bg-white shadow-lg rounded-4 overflow-hidden d-flex flex-column" [style.height]="'600px'">
      <!-- Header -->
      <div class="chat-header p-3 bg-gradient-primary text-white d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center">
          <div class="avatar-sm bg-white-transparent rounded-circle me-3 d-flex align-items-center justify-content-center">
            <i class="ti ti-messages fs-20"></i>
          </div>
          <div>
            <h6 class="mb-0 fw-bold">{{ ticket?.subject }}</h6>
            <span class="fs-11 text-white-50">Participants : {{ participants.length }}</span>
          </div>
        </div>
        <button class="btn btn-link text-white p-0" (click)="closeChat()">
          <i class="ti ti-x fs-20"></i>
        </button>
      </div>

      <!-- Participants Bar -->
      <div class="participants-bar px-3 py-2 bg-light border-bottom overflow-auto d-flex align-items-center">
        <div *ngFor="let p of participants" class="participant-item me-2" [title]="p.firstName + ' ' + p.lastName">
          <div class="avatar-xs bg-primary text-white rounded-circle d-flex align-items-center justify-content-center border border-white" 
               [style.background-color]="getParticipantColor(p)">
            {{ p.firstName.substring(0,1) }}{{ p.lastName.substring(0,1) }}
          </div>
        </div>
      </div>

      <!-- Messages Area -->
      <div class="chat-messages flex-grow-1 p-3 overflow-auto bg-soft-light" #scrollMe [scrollTop]="scrollMe.scrollHeight">
        <div *ngFor="let msg of messages" class="message-wrapper mb-3" [ngClass]="{'text-end': isMyMessage(msg)}">
          <div class="message-meta fs-10 text-muted mb-1" *ngIf="!isMyMessage(msg)">
            {{ msg.sender.firstName }} {{ msg.sender.lastName }} • {{ msg.createdAt | date:'HH:mm' }}
          </div>
          <div class="message-content d-inline-block p-2 px-3 rounded-4 shadow-sm"
               [ngClass]="isMyMessage(msg) ? 'bg-primary text-white' : 'bg-white text-dark border'">
            <p class="mb-0 fs-13">{{ msg.content }}</p>
            <div *ngIf="msg.images && msg.images.length > 0" class="message-images mt-2">
              <img *ngFor="let img of msg.images" [src]="img" class="rounded img-fluid mb-1" style="max-height: 150px;">
            </div>
          </div>
          <div class="message-meta fs-10 text-muted mt-1" *ngIf="isMyMessage(msg)">
            {{ msg.createdAt | date:'HH:mm' }}
          </div>
        </div>
      </div>

      <!-- Footer / Input -->
      <div class="chat-footer p-3 bg-white border-top">
        <div class="input-group">
          <button class="btn btn-light rounded-start-pill border-end-0" (click)="triggerFileInput()">
            <i class="ti ti-photo fs-18"></i>
          </button>
          <input type="text" class="form-control border-start-0 border-end-0 bg-light" 
                 placeholder="Tapez votre message..." [(ngModel)]="newMessage" (keyup.enter)="sendMessage()">
          <button class="btn btn-primary rounded-end-pill px-4" (click)="sendMessage()" [disabled]="!newMessage.trim()">
            <i class="ti ti-send"></i>
          </button>
        </div>
        <input type="file" id="chat-file-input" class="d-none" multiple (change)="onFileSelected($event)">
        <div class="image-previews mt-2 d-flex" *ngIf="selectedImages.length > 0">
           <div *ngFor="let img of selectedImages; let i = index" class="position-relative me-2">
             <img [src]="img" class="rounded border" style="width: 40px; height: 40px; object-fit: cover;">
             <span class="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-danger p-1" 
                   style="cursor: pointer" (click)="removeImage(i)">×</span>
           </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chat-container { border: 1px solid rgba(0,0,0,0.1); width: 100%; max-width: 450px; }
    .bg-gradient-primary { background: linear-gradient(135deg, #4e73df 0%, #224abe 100%); }
    .bg-white-transparent { background: rgba(255,255,255,0.2); }
    .bg-soft-light { background-color: #f8f9fc; }
    .message-content { max-width: 80%; word-wrap: break-word; }
    .avatar-xs { width: 24px; height: 24px; font-size: 10px; }
  `]
})
export class TicketChatComponent implements OnInit {
  @Input() ticket: any;
  @Input() ticketId: number | null = null;
  @Input() onClose: () => void = () => {};

  messages: any[] = [];
  participants: any[] = [];
  newMessage: string = '';
  selectedImages: string[] = [];
  currentUserId: number | null = null;
  refreshInterval: any;

  constructor(
    private ticketService: TicketService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUserId = this.authService.getUserId();
    
    if (this.ticketId && !this.ticket) {
      this.ticketService.getTicketById(this.ticketId).subscribe(res => {
        this.ticket = res;
        this.initializeChat();
      });
    } else if (this.ticket) {
      this.initializeChat();
    }
  }

  initializeChat() {
    if (this.ticket) {
      this.loadData();
      // Polling simple pour les messages
      if (this.refreshInterval) clearInterval(this.refreshInterval);
      this.refreshInterval = setInterval(() => this.loadMessages(), 5000);
    }
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadData() {
    this.loadMessages();
    this.loadParticipants();
  }

  loadMessages() {
    this.ticketService.getMessages(this.ticket.id).subscribe(data => {
      this.messages = data;
    });
  }

  loadParticipants() {
    this.ticketService.getParticipants(this.ticket.id).subscribe(data => {
      this.participants = data;
    });
  }

  sendMessage() {
    if (!this.newMessage.trim() && this.selectedImages.length === 0) return;
    if (!this.currentUserId) return;

    this.ticketService.addMessage(this.ticket.id, this.currentUserId, this.newMessage, this.selectedImages)
      .subscribe(() => {
        this.newMessage = '';
        this.selectedImages = [];
        this.loadMessages();
      });
  }

  isMyMessage(msg: any): boolean {
    return msg.sender.id === this.currentUserId;
  }

  getParticipantColor(p: any): string {
    // Liste simple de couleurs pour les avatars
    const colors = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#858796'];
    return colors[p.id % colors.length];
  }

  triggerFileInput() {
    document.getElementById('chat-file-input')?.click();
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files) {
      for (let file of files) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.selectedImages.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeImage(index: number) {
    this.selectedImages.splice(index, 1);
  }

  closeChat() {
    this.onClose();
  }
}
