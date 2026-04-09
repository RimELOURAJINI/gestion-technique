import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService } from '../../services/stats.service';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit.component.html',
  styleUrl: './audit.component.css'
})
export class AdminAuditComponent implements OnInit {
  auditLogs: any[] = [];

  constructor(private statsService: StatsService) {}

  ngOnInit(): void {
    this.statsService.getAuditLogs().subscribe(data => {
      this.auditLogs = data;
    });
  }
}
