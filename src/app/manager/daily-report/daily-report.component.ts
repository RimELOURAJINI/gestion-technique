import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { DailyReportOverviewComponent } from '../../shared/daily-report-overview/daily-report-overview.component';
import { DailyReportFormComponent } from '../../shared/daily-report-form/daily-report-form.component';

@Component({
  selector: 'app-manager-daily-report',
  standalone: true,
  imports: [CommonModule, DailyReportOverviewComponent, DailyReportFormComponent],
  template: `
    <div class="d-flex align-items-center justify-content-between mb-4">
      <div>
        <h4 class="fw-bold mb-1">
          <i class="ti ti-report-analytics me-2 text-primary"></i>Rapports du Jour — Mon Équipe
        </h4>
        <p class="text-muted fs-13 mb-0">{{ today | date:'EEEE d MMMM yyyy' }}</p>
      </div>
      <button class="btn btn-soft-primary rounded-pill fw-semibold" (click)="showMyReportForm = true">
        <i class="ti ti-pencil me-2"></i>Mon Rapport
      </button>
    </div>

    <app-daily-report-overview
      mode="team"
      [userId]="userId"
      [managerId]="userId">
    </app-daily-report-overview>

    <app-daily-report-form
      [userId]="userId"
      [isOpen]="showMyReportForm"
      (closed)="showMyReportForm = false">
    </app-daily-report-form>
  `
})
export class ManagerDailyReportComponent implements OnInit {
  userId: number = 0;
  showMyReportForm = false;
  today = new Date();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const id = this.authService.getUserId();
    if (id) this.userId = id;
  }
}
