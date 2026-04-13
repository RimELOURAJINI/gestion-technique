import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HrService } from '../../services/hr.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AdminAttendanceComponent implements OnInit {
  attendances: any[] = [];
  isLoading = false;
  selectedDate: string = new Date().toISOString().split('T')[0];

  constructor(private hrService: HrService) {}

  ngOnInit(): void {
    this.loadAllAttendance();
  }

  loadAllAttendance(): void {
    this.isLoading = true;
    const date = new Date(this.selectedDate);
    this.hrService.getAllAttendanceByDate(date).subscribe({
      next: (data) => {
        this.attendances = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading attendances', err);
        this.isLoading = false;
      }
    });
  }

  onDateChange(): void {
    this.loadAllAttendance();
  }

  getStatusClass(status: string): string {
    return status === 'PRESENT' ? 'badge bg-soft-success text-success' : 'badge bg-soft-secondary text-secondary';
  }
}
