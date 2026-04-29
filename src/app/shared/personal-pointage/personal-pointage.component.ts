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

  // Timer properties
  timerInterval: any;
  elapsedTime: string = '00:00:00';
  
  // Weekly History
  weeklyHistory: any[] = [];
  
  // Session details
  sessionComment: string = '';
  isTelework: boolean = false;

  constructor(
    private hrService: HrService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadTodayAttendance();
    this.loadWeeklyHistory();
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  loadTodayAttendance(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.hrService.getTodayAttendance(userId).subscribe({
      next: (res) => {
        this.activeAttendance = res;
        if (this.activeAttendance?.checkIn && !this.activeAttendance?.checkOut) {
          this.startTimer(new Date(this.activeAttendance.checkIn));
        }
      },
      error: (err) => console.error('[POINTAGE] Error loading today status', err)
    });
  }

  loadWeeklyHistory(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;
    this.hrService.getMyAttendance(userId).subscribe(history => {
      // Get last 7 days summary
      this.weeklyHistory = history.slice(0, 7);
    });
  }

  startTimer(checkInTime: Date): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    
    this.timerInterval = setInterval(() => {
      const now = new Date().getTime();
      const diff = now - checkInTime.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      this.elapsedTime = 
        (hours < 10 ? '0' + hours : hours) + ':' + 
        (minutes < 10 ? '0' + minutes : minutes) + ':' + 
        (seconds < 10 ? '0' + seconds : seconds);
    }, 1000);
  }

  onCheckIn(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;
    this.isClockingIn = true;
    this.hrService.checkIn(userId).subscribe({
      next: (res) => {
        this.activeAttendance = res;
        this.isClockingIn = false;
        this.startTimer(new Date(res.checkIn));
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
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.loadWeeklyHistory();
      },
      error: (err) => {
        console.error('[POINTAGE] Check-out error', err);
        this.isClockingIn = false;
      }
    });
  }

  getDuration(checkIn: any, checkOut: any): string {
    if (!checkIn || !checkOut) return '-';
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }
}
