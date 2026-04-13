import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService } from '../../services/stats.service';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit.component.html',
  styleUrl: './audit.component.css'
})
export class AdminAuditComponent implements OnInit {
  auditLogs: any[] = [];
  activeUsersCount = 0;
  criticalAlerts = 0;

  constructor(private statsService: StatsService, private adminService: AdminService) {}

  ngOnInit(): void {
    this.statsService.getAuditLogs().subscribe(data => {
      this.auditLogs = data;
    });

    this.adminService.getAllUsers().subscribe({
      next: (res: any) => {
        const users = res.users || res;
        this.activeUsersCount = users.length || 0;
      }
    });

    this.adminService.getReclamations().subscribe({
      next: (reclamations) => {
        this.criticalAlerts = reclamations.filter(r => r.status === 'PENDING').length;
      }
    });
  }
}
