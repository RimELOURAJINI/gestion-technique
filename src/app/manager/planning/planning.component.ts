import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService } from '../../services/stats.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-planning',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './planning.component.html',
  styleUrl: './planning.component.css'
})
export class ManagerPlanningComponent implements OnInit {
  workloadData: any[] = [];
  globalOccupancy: number = 0;
  overloadedCount: number = 0;

  constructor(
    private statsService: StatsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const managerId = this.authService.getUserId();
    if (managerId) {
      this.statsService.getTeamWorkload(managerId).subscribe(data => {
        this.workloadData = data;
        
        // Calculer les stats globales
        if (data.length > 0) {
          const totalRate = data.reduce((acc: number, item: any) => acc + item.occupancyRate, 0);
          this.globalOccupancy = Math.round(totalRate / data.length);
          this.overloadedCount = data.filter((item: any) => item.occupancyRate > 95).length;
        }
      });
    }
  }
}
