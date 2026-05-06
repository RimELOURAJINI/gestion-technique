import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService } from '../../services/stats.service';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './finance.component.html',
  styleUrl: './finance.component.css'
})
export class AdminFinanceComponent implements OnInit {
  stats: any = {};
  recentProjects: any[] = [];

  constructor(
    private statsService: StatsService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.statsService.getFinanceStats().subscribe(data => {
      this.stats = data;
    });

    this.adminService.getAllProjects().subscribe(data => {
      // Sort projects by budget descending and take top 5
      this.recentProjects = data
        .filter(p => p.budget != null)
        .sort((a, b) => (b.budget || 0) - (a.budget || 0))
        .slice(0, 5);
    });
  }
}

