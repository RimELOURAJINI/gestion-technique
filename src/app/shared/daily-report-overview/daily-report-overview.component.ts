import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DailyReportService } from '../../services/daily-report.service';
import { DailyReportSummary, DailyReport } from '../../models/models';
import { DailyReportFormComponent } from '../daily-report-form/daily-report-form.component';

@Component({
  selector: 'app-daily-report-overview',
  standalone: true,
  imports: [CommonModule, DailyReportFormComponent, FormsModule],
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
  selectedDate: string = new Date().toISOString().split('T')[0];
  searchTerm: string = '';

  // Detail modal
  selectedReport: DailyReport | null = null;
  showDetail = false;

  // Form panel (for 'self' mode)
  showReportForm = false;

  constructor(private dailyReportService: DailyReportService) {}

  ngOnInit(): void {
    this.load();
  }

  onDateChange(): void {
    this.load();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userId'] || changes['managerId'] || changes['mode']) {
      this.load();
    }
  }

  load(): void {
    this.isLoading = true;
    const dateParam = this.selectedDate;

    if (this.mode === 'admin') {
      this.dailyReportService.getAllReports(dateParam).subscribe({
        next: (data) => { this.summaries = data; this.isLoading = false; },
        error: () => { this.isLoading = false; }
      });
      // Also load own report for Admin history
      if (this.userId) {
        this.dailyReportService.getMyReport(this.userId, dateParam).subscribe({
          next: (r) => this.myReport = r,
          error: () => {}
        });
      }
    } else if (this.mode === 'team' && this.managerId) {
      this.dailyReportService.getTeamReports(this.managerId, dateParam).subscribe({
        next: (data: any[]) => { 
          this.summaries = data.map(item => {
            if (item.userName !== undefined) {
              return item as DailyReportSummary;
            } else {
              return {
                userId: item.user?.id || 0,
                userName: ((item.user?.firstName || '') + ' ' + (item.user?.lastName || '')).trim() || 'Inconnu',
                userRole: item.user?.roles?.[0]?.name || '',
                submitted: true,
                hasProblems: !!item.problemsEncountered,
                reportId: item.id,
                submittedAt: item.submittedAt,
                sentiment: item.sentiment || 'neutral'
              };
            }
          });
          this.isLoading = false; 
        },
        error: () => { this.isLoading = false; }
      });
      // Also load own report
      if (this.userId) {
        this.dailyReportService.getMyReport(this.userId, dateParam).subscribe({
          next: (r) => this.myReport = r,
          error: () => {}
        });
      }
    } else if (this.mode === 'self' && this.userId) {
      this.dailyReportService.getMyReport(this.userId, dateParam).subscribe({
        next: (r) => { this.myReport = r; this.isLoading = false; },
        error: () => { this.isLoading = false; }
      });
    }
  }

  get userNames(): string[] {
    const names = this.summaries.map(s => s.userName);
    return Array.from(new Set(names)).sort();
  }

  get filteredSummaries(): DailyReportSummary[] {
    if (!this.searchTerm || this.searchTerm === 'all') return this.summaries;
    const term = this.searchTerm.toLowerCase().trim();
    return this.summaries.filter(s => 
      s.userName.toLowerCase().includes(term) || 
      this.getRoleLabel(s.userRole).toLowerCase().includes(term)
    );
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

  isToday(): boolean {
    const todayStr = new Date().toISOString().split('T')[0];
    return this.selectedDate === todayStr;
  }
}
