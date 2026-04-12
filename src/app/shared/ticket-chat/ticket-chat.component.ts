import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-ticket-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-container bg-white d-flex flex-column h-100">
      <!-- Header -->
      <div *ngIf="showHeader" class="chat-header p-3 bg-gradient-primary text-white d-flex justify-content-between align-items-center flex-shrink-0">
        <div class="d-flex align-items-center">
          <div class="avatar-sm bg-white-transparent rounded-circle me-3 d-flex align-items-center justify-content-center">
            <i class="ti ti-messages fs-20"></i>
          </div>
          <div>
            <h6 class="mb-0 fw-bold">{{ resolvedTicket?.subject || 'Support Chat' }}</h6>
            <div class="d-flex align-items-center">
                <span class="fs-11 text-white-50 me-2" *ngIf="resolvedTicket?.project">
                   <i class="ti ti-briefcase fs-10"></i> {{ resolvedTicket.project.name }}
                </span>
                <span class="fs-11 text-white-50">• {{ participants.length }} participant(s)</span>
            </div>
          </div>
        </div>
        <button class="btn btn-link text-white p-0" (click)="closeChat()">
          <i class="ti ti-x fs-20"></i>
        </button>
      </div>

      <!-- Participants Bar -->
      <div class="participants-bar px-3 py-2 bg-light border-bottom overflow-auto d-flex align-items-center flex-shrink-0" *ngIf="participants.length > 0">
        <span class="fs-10 text-muted me-2 fw-bold text-uppercase">Participants :</span>
        <div *ngFor="let p of participants" class="participant-item me-2" [title]="p.firstName + ' ' + p.lastName">
          <div class="avatar-xs rounded-circle d-flex align-items-center justify-content-center border border-2 border-white text-white fw-bold fs-10"
               [style.background]="getParticipantColor(p)">
            {{ (p.firstName || '?').charAt(0) }}{{ (p.lastName || '').charAt(0) }}
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="flex-grow-1 d-flex align-items-center justify-content-center">
        <div class="text-center text-muted">
          <div class="spinner-border spinner-border-sm mb-2"></div>
          <p class="fs-12">Chargement du chat...</p>
        </div>
      </div>

      <!-- Messages Area -->
      <div *ngIf="!loading" class="chat-messages flex-grow-1 p-3 overflow-auto bg-soft-light" 
           style="min-height: 0;" #scrollMe [scrollTop]="scrollMe.scrollHeight">
        <div *ngIf="messages.length === 0" class="text-center text-muted py-5">
          <i class="ti ti-message-off fs-2 d-block mb-2"></i>
          <p class="fs-12">Aucun message pour l'instant. Commencez la discussion !</p>
        </div>
        <div *ngFor="let msg of messages" class="message-wrapper mb-3" [ngClass]="{'text-end': isMyMessage(msg)}">
          <div class="message-meta fs-10 text-muted mb-1" *ngIf="!isMyMessage(msg)">
            {{ msg.sender?.firstName }} {{ msg.sender?.lastName }} • {{ msg.createdAt | date:'HH:mm' }}
          </div>
          <div class="message-bubble d-inline-block p-2 px-3 rounded-4 shadow-sm"
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
      <div class="chat-footer p-3 bg-white border-top flex-shrink-0">
        <div class="input-group">
          <button class="btn btn-light rounded-start-pill border border-end-0" (click)="triggerFileInput()">
            <i class="ti ti-photo fs-16"></i>
          </button>
          <input type="text" class="form-control border bg-light"
                 placeholder="Tapez votre message..." [(ngModel)]="newMessage" (keyup.enter)="sendMessage()">
          <button class="btn btn-primary rounded-end-pill px-3" (click)="sendMessage()" [disabled]="!newMessage.trim()">
            <i class="ti ti-send fs-16"></i>
          </button>
        </div>
        <input type="file" id="chat-file-input" class="d-none" multiple (change)="onFileSelected($event)">
        <div class="image-previews mt-2 d-flex flex-wrap" *ngIf="selectedImages.length > 0">
          <div *ngFor="let img of selectedImages; let i = index" class="position-relative me-2 mb-1">
            <img [src]="img" class="rounded border" style="width: 48px; height: 48px; object-fit: cover;">
            <button class="btn btn-danger btn-xs position-absolute top-0 end-0 p-0" style="width:16px;height:16px;font-size:10px;line-height:1;" (click)="removeImage(i)">×</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chat-container { border: 1px solid rgba(0,0,0,0.08); border-radius: 16px; overflow: hidden; }
    .bg-gradient-primary { background: linear-gradient(135deg, #4e73df 0%, #224abe 100%); }
    .bg-white-transparent { background: rgba(255,255,255,0.2); }
    .bg-soft-light { background-color: #f8f9fc; }
    .message-bubble { max-width: 75%; word-wrap: break-word; }
    .avatar-xs { width: 28px; height: 28px; font-size: 10px; flex-shrink: 0; }
    .avatar-sm { width: 36px; height: 36px; }
    .participants-bar { min-height: 44px; }
    .chat-messages { min-height: 0; }
    :host { display: flex; flex-direction: column; height: 100%; min-height: 0; }
  `]
})
export class TicketChatComponent implements OnInit, OnDestroy, OnChanges {
  @Input() ticket: any;
  @Input() ticketId: number | null = null;
  @Input() onClose: () => void = () => {};
  @Input() showHeader: boolean = true;

  resolvedTicket: any = null;
  messages: any[] = [];
  participants: any[] = [];
  newMessage: string = '';
  selectedImages: string[] = [];
  currentUserId: number | null = null;
  refreshInterval: any;
  loading: boolean = false;

  constructor(
    private ticketService: TicketService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUserId = this.authService.getUserId();
    this.initialize();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['ticketId'] || changes['ticket']) {
      this.initialize();
    }
  }

  initialize() {
    const effectiveTicketId = this.ticketId ?? this.ticket?.id ?? null;
    if (!effectiveTicketId) return;

    this.loading = true;
    if (this.refreshInterval) clearInterval(this.refreshInterval);

    if (this.ticket) {
      this.resolvedTicket = this.ticket;
      this.loadData();
      this.refreshInterval = setInterval(() => this.loadMessages(), 5000);
    } else if (this.ticketId) {
      this.ticketService.getTicketById(this.ticketId).subscribe({
        next: (res) => {
          this.resolvedTicket = res;
          this.ticket = res;
          this.loadData();
          this.refreshInterval = setInterval(() => this.loadMessages(), 5000);
        },
        error: () => { this.loading = false; }
      });
    }
  }

  ngOnDestroy() {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
  }

  loadData() {
    this.loadMessages(true);
    this.loadParticipants();
  }

  loadMessages(isFirstLoad: boolean = false) {
    if (!this.resolvedTicket?.id) return;
    this.ticketService.getMessages(this.resolvedTicket.id).subscribe({
      next: (data) => {
        this.messages = data || [];
        if (isFirstLoad) this.loading = false;
      },
      error: () => {
        if (isFirstLoad) this.loading = false;
      }
    });
  }

  loadParticipants() {
    if (!this.resolvedTicket?.id) return;
    this.ticketService.getParticipants(this.resolvedTicket.id).subscribe(data => {
      this.participants = data || [];
    });
  }

  sendMessage() {
    if (!this.newMessage.trim() && this.selectedImages.length === 0) return;
    if (!this.currentUserId || !this.resolvedTicket?.id) return;

    this.ticketService.addMessage(this.resolvedTicket.id, this.currentUserId, this.newMessage, this.selectedImages)
      .subscribe(() => {
        this.newMessage = '';
        this.selectedImages = [];
        this.loadMessages();
      });
  }

  isMyMessage(msg: any): boolean {
    return msg.sender?.id === this.currentUserId;
  }

  getParticipantColor(p: any): string {
    const colors = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#858796', '#6f42c1'];
    return colors[Number(p.id) % colors.length];
  }

  triggerFileInput() {
    document.getElementById('chat-file-input')?.click();
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    if (files) {
      for (const file of files) {
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
