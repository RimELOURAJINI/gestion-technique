import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService } from '../../services/stats.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-manager-performance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './performance.component.html',
  styleUrl: './performance.component.css'
})
export class ManagerPerformanceComponent implements OnInit {
  workloadData: any[] = [];
  isLoading = true;

  constructor(
    private statsService: StatsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.loadPerformanceData(userId);
    }
  }

  loadPerformanceData(managerId: number): void {
    this.isLoading = true;
    this.statsService.getTeamWorkload(managerId).subscribe({
      next: (data) => {
        this.workloadData = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading performance data', err);
        this.isLoading = false;
      }
    });
  }

  getProgressBarClass(percent: number): string {
    if (percent > 90) return 'progress-bar bg-danger';
    if (percent > 70) return 'progress-bar bg-warning';
    return 'progress-bar bg-success';
  }
}
