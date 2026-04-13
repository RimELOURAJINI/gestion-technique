import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HrService } from '../../services/hr.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-manager-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class ManagerAttendanceComponent implements OnInit {
  attendanceList: any[] = [];
  selectedDate: string = new Date().toISOString().split('T')[0];
  isLoading = true;
  managerId: number | null = null;

  constructor(
    private hrService: HrService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.managerId = this.authService.getUserId();
    this.loadAttendance();
  }

  loadAttendance(): void {
    if (!this.managerId) return;
    this.isLoading = true;
    const date = new Date(this.selectedDate);
    
    this.hrService.getTeamAttendance(this.managerId, date).subscribe({
      next: (data) => {
        this.attendanceList = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading team attendance', err);
        this.isLoading = false;
      }
    });
  }

  onDateChange(): void {
    this.loadAttendance();
  }

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PRESENT': return 'badge bg-soft-success text-success';
      case 'ABSENT': return 'badge bg-soft-danger text-danger';
      case 'LATE': return 'badge bg-soft-warning text-warning';
      default: return 'badge bg-soft-secondary text-secondary';
    }
  }
}
