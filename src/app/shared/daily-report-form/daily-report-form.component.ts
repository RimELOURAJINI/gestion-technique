import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DailyReportService } from '../../services/daily-report.service';
import { DailyReport } from '../../models/models';

@Component({
  selector: 'app-daily-report-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './daily-report-form.component.html',
  styleUrl: './daily-report-form.component.css'
})
export class DailyReportFormComponent implements OnInit, OnChanges {
  @Input() userId!: number;
  @Input() isOpen: boolean = false;
  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<DailyReport>();

  report: DailyReport = {
    tasksAccomplished: '',
    problemsEncountered: '',
    victories: '',
    notes: ''
  };

  existingReport: DailyReport | null = null;
  isLoading = false;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  today = new Date();

  constructor(private dailyReportService: DailyReportService) {}

  ngOnInit(): void {
    if (this.userId) {
      this.loadMyReport();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && changes['isOpen'].currentValue === true && this.userId) {
      this.loadMyReport();
    }
  }

  loadMyReport(): void {
    this.isLoading = true;
    this.dailyReportService.getMyReport(this.userId).subscribe({
      next: (report) => {
        this.existingReport = report;
        if (report) {
          this.report = { ...report };
        } else {
          this.report = { tasksAccomplished: '', problemsEncountered: '', victories: '', notes: '' };
        }
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  get isSubmitted(): boolean {
    return !!this.existingReport;
  }

  submitReport(): void {
    if (!this.report.tasksAccomplished.trim() && !this.report.problemsEncountered.trim()) {
      this.errorMessage = 'Veuillez renseigner au moins les tâches accomplies.';
      return;
    }
    this.isSubmitting = true;
    this.errorMessage = '';
    
    // Matche la structure de l'entité Backend (ManyToOne User)
    const payload: any = { 
      ...this.report, 
      user: { id: this.userId } 
    };
    
    this.dailyReportService.submitReport(payload).subscribe({
      next: (result) => {
        this.existingReport = result;
        this.isSubmitting = false;
        this.successMessage = 'Rapport soumis avec succès !';
        this.submitted.emit(result);
        setTimeout(() => this.successMessage = '', 4000);
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'Erreur lors de la soumission. Veuillez réessayer.';
      }
    });
  }

  close(): void {
    this.closed.emit();
  }
}
