import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DailyReportService } from '../../services/daily-report.service';
import { DailyReportSummary, DailyReport } from '../../models/models';
import { DailyReportFormComponent } from '../daily-report-form/daily-report-form.component';

@Component({
  selector: 'app-daily-report-overview',
  standalone: true,
  imports: [CommonModule, DailyReportFormComponent],
  templateUrl: './daily-report-overview.component.html',
  styleUrl: './daily-report-overview.component.css'
})
export class DailyReportOverviewComponent implements OnInit, OnChanges {
  /** 'admin' → full table ; 'team' → cards ; 'self' → just own report card */
  @Input() mode: 'admin' | 'team' | 'self' = 'self';
  @Input() userId!: number;
  /** For manager/commercial-leader: pass managerId */
  @Input() managerId?: number;

  summaries: DailyReportSummary[] = [];
  myReport: DailyReport | null = null;
  isLoading = true;
  today = new Date();

  // Detail modal
  selectedReport: DailyReport | null = null;
  showDetail = false;

  // Form panel (for 'self' mode)
  showReportForm = false;

  constructor(private dailyReportService: DailyReportService) {}

  ngOnInit(): void {
    this.load();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userId'] || changes['managerId'] || changes['mode']) {
      this.load();
    }
  }

  load(): void {
    this.isLoading = true;
    if (this.mode === 'admin') {
      this.dailyReportService.getAllReports().subscribe({
        next: (data) => { this.summaries = data; this.isLoading = false; },
        error: () => { this.isLoading = false; }
      });
    } else if (this.mode === 'team' && this.managerId) {
      this.dailyReportService.getTeamReports(this.managerId).subscribe({
        next: (data) => { this.summaries = data; this.isLoading = false; },
        error: () => { this.isLoading = false; }
      });
      // Also load own report
      if (this.userId) {
        this.dailyReportService.getMyReport(this.userId).subscribe({
          next: (r) => this.myReport = r,
          error: () => {}
        });
      }
    } else if (this.mode === 'self' && this.userId) {
      this.dailyReportService.getMyReport(this.userId).subscribe({
        next: (r) => { this.myReport = r; this.isLoading = false; },
        error: () => { this.isLoading = false; }
      });
    }
  }

  get submittedCount(): number {
    return this.summaries.filter(s => s.submitted).length;
  }
  get notSubmittedCount(): number {
    return this.summaries.filter(s => !s.submitted).length;
  }
  get problemCount(): number {
    return this.summaries.filter(s => s.hasProblems).length;
  }

  getSentimentClass(sentiment: string | undefined): string {
    if (sentiment === 'positive') return 'badge-soft-success text-success';
    if (sentiment === 'negative') return 'badge-soft-danger text-danger';
    return 'badge-soft-secondary text-muted';
  }

  getSentimentLabel(sentiment: string | undefined): string {
    if (sentiment === 'positive') return 'Positif 😊';
    if (sentiment === 'negative') return 'Négatif 😟';
    return 'Neutre 😐';
  }

  openDetail(reportId: number): void {
    this.dailyReportService.getReportById(reportId).subscribe({
      next: (r) => { this.selectedReport = r; this.showDetail = true; },
      error: () => {}
    });
  }

  closeDetail(): void {
    this.showDetail = false;
    this.selectedReport = null;
  }

  openReportForm(): void {
    this.showReportForm = true;
  }

  onReportSubmitted(report: DailyReport): void {
    this.myReport = report;
    this.showReportForm = false;
  }

  getRoleLabel(role: string): string {
    const map: Record<string, string> = {
      'ROLE_ADMIN': 'Admin',
      'ROLE_TEAM_LEADER': 'Manager',
      'ROLE_Employee': 'Employé',
      'ROLE_COMMERCIAL': 'Commercial',
      'ROLE_COMMERCIAL_LEADER': 'Leader Commercial'
    };
    return map[role] || role;
  }
}
