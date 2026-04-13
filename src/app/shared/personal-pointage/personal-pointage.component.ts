import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HrService } from '../../services/hr.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-personal-pointage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './personal-pointage.component.html',
  styleUrls: ['./personal-pointage.component.css']
})
export class PersonalPointageComponent implements OnInit {
  activeAttendance: any = null;
  isClockingIn = false;
  today: Date = new Date();

  constructor(
    private hrService: HrService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadTodayAttendance();
  }

  loadTodayAttendance(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.hrService.getTodayAttendance(userId).subscribe({
      next: (res) => {
        this.activeAttendance = res;
      },
      error: (err) => console.error('[POINTAGE] Error loading today status', err)
    });
  }

  onCheckIn(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;
    this.isClockingIn = true;
    this.hrService.checkIn(userId).subscribe({
      next: (res) => {
        this.activeAttendance = res;
        this.isClockingIn = false;
      },
      error: (err) => {
        console.error('[POINTAGE] Check-in error', err);
        this.isClockingIn = false;
        alert('Erreur lors du pointage. Réessayez plus tard.');
      }
    });
  }

  onCheckOut(): void {
    const userId = this.authService.getUserId();
    if (!userId || !this.activeAttendance) return;
    this.isClockingIn = true;
    this.hrService.checkOut(userId, this.activeAttendance.id).subscribe({
      next: (res) => {
        this.activeAttendance = res;
        this.isClockingIn = false;
      },
      error: (err) => {
        console.error('[POINTAGE] Check-out error', err);
        this.isClockingIn = false;
      }
    });
  }
}
