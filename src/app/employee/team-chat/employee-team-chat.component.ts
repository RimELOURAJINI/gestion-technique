import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TeamChatService } from '../../services/team-chat.service';
import { AuthService } from '../../services/auth.service';
import { TeamLeaderService } from '../../services/manager.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-employee-team-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-team-chat.component.html',
  styleUrls: ['./employee-team-chat.component.css']
})
export class EmployeeTeamChatComponent implements OnInit, OnDestroy {
  team: any = null;
  members: any[] = [];
  messages: any[] = [];
  selectedParticipant: any = null;
  newMessage = '';
  currentUserId: number | null = null;
  isLoading = true;
  errorMessage = '';
  private pollSubscription?: Subscription;
  private initialMemberId: number | null = null;

  constructor(
    private teamChatService: TeamChatService,
    private authService: AuthService,
    private teamLeaderService: TeamLeaderService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserId();
    this.route.queryParams.subscribe(params => {
      this.initialMemberId = params['memberId'] ? +params['memberId'] : null;
    });
    this.loadTeamData();
    this.pollSubscription = interval(5000).subscribe(() => this.loadMessages());
  }

  ngOnDestroy(): void {
    this.pollSubscription?.unsubscribe();
  }

  loadTeamData(): void {
    if (!this.currentUserId) return;

    // Employee looks up their team as a MEMBER (not manager)
    this.teamLeaderService.getTeamByMemberId(this.currentUserId).subscribe({
      next: (res) => {
        this.team = res;
        this.members = (res.users || []).filter((m: any) => m.id !== this.currentUserId);
        this.isLoading = false;
        this.loadMessages();
        if (this.initialMemberId) {
          const found = this.members.find((m: any) => m.id === this.initialMemberId);
          if (found) this.selectContact(found);
        }
      },
      error: (err) => {
        console.error('Error loading team', err);
        this.isLoading = false;
        this.errorMessage = "Vous ne faites partie d'aucune équipe.";
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
      this.teamChatService.getPrivateMessages(this.team.id, this.currentUserId!, this.selectedParticipant.id).subscribe({
        next: (data) => { this.messages = data; this.scrollToBottom(); }
      });
    } else {
      this.teamChatService.getGlobalMessages(this.team.id).subscribe({
        next: (data) => { this.messages = data; this.scrollToBottom(); }
      });
    }
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.team || !this.currentUserId) return;
    const payload: any = { senderId: this.currentUserId, teamId: this.team.id, content: this.newMessage };
    if (this.selectedParticipant) payload.recipientId = this.selectedParticipant.id;
    this.teamChatService.sendMessage(payload).subscribe({
      next: (msg) => { this.messages.push(msg); this.newMessage = ''; this.scrollToBottom(); }
    });
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const container = document.getElementById('emp-chat-container');
      if (container) container.scrollTop = container.scrollHeight;
    }, 100);
  }
}
