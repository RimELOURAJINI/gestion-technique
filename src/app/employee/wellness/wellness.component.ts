import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatsService } from '../../services/stats.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-wellness',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './wellness.component.html',
  styleUrl: './wellness.component.css'
})
export class EmployeeWellnessComponent implements OnInit {
  energyLevel: number = 85;
  mood: string = 'Zen';
  userId: number | null = null;
  message: string = '';

  constructor(
    private statsService: StatsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserId();
    // On pourrait charger les valeurs initiales ici si besoin
  }

  saveWellness(): void {
    if (this.userId) {
      this.statsService.updateWellness(this.userId, this.energyLevel, this.mood).subscribe({
        next: () => {
          this.message = 'Statut mis à jour !';
          setTimeout(() => this.message = '', 3000);
        },
        error: () => {
          this.message = 'Erreur lors de la mise à jour.';
        }
      });
    }
  }
}
