import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamLeaderService } from '../../services/manager.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-manager-contacts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.css'
})
export class ManagerContactsComponent implements OnInit {
  members: User[] = [];
  filteredMembers: User[] = [];
  searchTerm: string = '';
  isLoading = true;

  constructor(
    private teamLeaderService: TeamLeaderService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.loadMembers(userId);
    }
  }

  loadMembers(managerId: number): void {
    this.isLoading = true;
    this.teamLeaderService.getMyTeam(managerId).subscribe({
      next: (team) => {
        this.members = team?.users || [];
        this.filteredMembers = [...this.members];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading contacts', err);
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredMembers = [...this.members];
    } else {
      this.filteredMembers = this.members.filter(m => 
        m.firstName.toLowerCase().includes(term) || 
        m.lastName.toLowerCase().includes(term) || 
        m.email.toLowerCase().includes(term)
      );
    }
  }
}
