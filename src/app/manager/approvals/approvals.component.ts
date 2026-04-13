import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService } from '../../services/stats.service';
import { HrService } from '../../services/hr.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-approvals',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './approvals.component.html',
  styleUrl: './approvals.component.css'
})
export class ManagerApprovalsComponent implements OnInit {
  stats: any = { pendingReclamations: 0 };
  pendingLeaves: any[] = [];
  pendingReclamations: any[] = [];
  isLoading = true;

  constructor(
    private statsService: StatsService,
    private hrService: HrService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const managerId = this.authService.getUserId();
    if (managerId) {
      this.loadData(managerId);
    }
  }

  loadData(managerId: number): void {
    this.isLoading = true;
    
    // Load counts
    this.statsService.getPendingApprovals(managerId).subscribe(data => {
      this.stats = data;
    });

    // Load Real Leaves
    this.hrService.getPendingTeamLeaves(managerId).subscribe(data => {
      this.pendingLeaves = data;
      this.isLoading = false;
    });

    // Add logic for pending tasks or reclamations if needed
  }

  processLeave(leaveId: number, status: string): void {
    const managerId = this.authService.getUserId();
    if (!managerId) return;
    
    this.hrService.processLeave(leaveId, managerId, status).subscribe(() => {
        this.loadData(managerId);
    });
  }
}
