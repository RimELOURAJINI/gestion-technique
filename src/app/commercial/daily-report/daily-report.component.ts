import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { DailyReportOverviewComponent } from '../../shared/daily-report-overview/daily-report-overview.component';

@Component({
  selector: 'app-commercial-daily-report',
  standalone: true,
  imports: [CommonModule, DailyReportOverviewComponent],
  template: `
    <div class="d-flex align-items-center justify-content-between mb-4">
      <div>
        <h4 class="fw-bold mb-1">
          <i class="ti ti-report-analytics me-2 text-primary"></i>Mon Rapport du Jour
        </h4>
        <p class="text-muted fs-13 mb-0">{{ today | date:'EEEE d MMMM yyyy' }}</p>
      </div>
    </div>
    <app-daily-report-overview
      mode="self"
      [userId]="userId">
    </app-daily-report-overview>
  `
})
export class CommercialDailyReportComponent implements OnInit {
  userId: number = 0;
  today = new Date();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const id = this.authService.getUserId();
    if (id) this.userId = id;
  }
}
