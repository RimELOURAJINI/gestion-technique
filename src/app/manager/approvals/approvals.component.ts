import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService } from '../../services/stats.service';
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

  constructor(
    private statsService: StatsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const managerId = this.authService.getUserId();
    if (managerId) {
      this.statsService.getPendingApprovals(managerId).subscribe(data => {
        this.stats = data;
      });
    }
  }
}
