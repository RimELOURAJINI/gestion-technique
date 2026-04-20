import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { DailyReportService } from '../../services/daily-report.service';
import { DailyReportOverviewComponent } from '../../shared/daily-report-overview/daily-report-overview.component';
import { DailyReportFormComponent } from '../../shared/daily-report-form/daily-report-form.component';

@Component({
  selector: 'app-admin-daily-reports',
  standalone: true,
  imports: [CommonModule, DailyReportOverviewComponent, DailyReportFormComponent],
  templateUrl: './daily-reports.component.html',
  styleUrl: './daily-reports.component.css'
})
export class AdminDailyReportsComponent implements OnInit {
  userId: number = 0;
  showMyReportForm = false;
  today = new Date();

  constructor(
    private authService: AuthService,
    private dailyReportService: DailyReportService
  ) {}

  ngOnInit(): void {
    const id = this.authService.getUserId();
    if (id) this.userId = id;
  }
}
