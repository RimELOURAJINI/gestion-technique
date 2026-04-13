import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeamChatService } from '../../services/team-chat.service';
import { AuthService } from '../../services/auth.service';
import { TeamLeaderService } from '../../services/manager.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-team-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './team-chat.component.html',
  styleUrls: ['./team-chat.component.css']
})
export class TeamChatComponent implements OnInit, OnDestroy {
  team: any = null;
  members: any[] = [];
  messages: any[] = [];
  selectedParticipant: any = null; // null means 'Global Team'
  newMessage = '';
  currentUserId: number | null = null;
  isLoading = true;
  private pollSubscription?: Subscription;

  constructor(
    private teamChatService: TeamChatService,
    private authService: AuthService,
    private teamLeaderService: TeamLeaderService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserId();
    this.loadTeamData();
    // Refresh messages every 5 seconds
    this.pollSubscription = interval(5000).subscribe(() => this.loadMessages());
  }

  ngOnDestroy(): void {
    this.pollSubscription?.unsubscribe();
  }

  loadTeamData(): void {
    if (!this.currentUserId) return;
    this.teamLeaderService.getMyTeam(this.currentUserId).subscribe({
      next: (res) => {
        this.team = res;
        this.members = res.users || [];
        this.isLoading = false;
        this.loadMessages();
      },
      error: (err) => {
        console.error('Error loading team', err);
        this.isLoading = false;
      }
    });
  }

  selectContact(member: any): void {
    this.selectedParticipant = member;
    this.messages = [];
    this.loadMessages();
  }

  loadMessages(): void {
    if (!this.team) return;

    if (this.selectedParticipant) {
      // Private chat
      this.teamChatService.getPrivateMessages(this.team.id, this.currentUserId!, this.selectedParticipant.id).subscribe({
        next: (data) => {
          this.messages = data;
          this.scrollToBottom();
        }
      });
    } else {
      // Global chat
      this.teamChatService.getGlobalMessages(this.team.id).subscribe({
        next: (data) => {
          this.messages = data;
          this.scrollToBottom();
        }
      });
    }
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.team || !this.currentUserId) return;

    const payload: any = {
      senderId: this.currentUserId,
      teamId: this.team.id,
      content: this.newMessage
    };

    if (this.selectedParticipant) {
      payload.recipientId = this.selectedParticipant.id;
    }

    this.teamChatService.sendMessage(payload).subscribe({
      next: (msg) => {
        this.messages.push(msg);
        this.newMessage = '';
        this.scrollToBottom();
      }
    });
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const container = document.getElementById('chat-container');
      if (container) container.scrollTop = container.scrollHeight;
    }, 100);
  }
}
