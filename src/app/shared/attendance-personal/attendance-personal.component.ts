import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonalPointageComponent } from '../../shared/personal-pointage/personal-pointage.component';
import { HrService } from '../../services/hr.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-attendance-personal',
  standalone: true,
  imports: [CommonModule, PersonalPointageComponent],
  template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <div class="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h4 class="fw-bold mb-1">Mon Pointage & Présence</h4>
              <p class="text-muted fs-13">Suivi personnel de vos arrivées et départs.</p>
            </div>
          </div>
          
          <app-personal-pointage></app-personal-pointage>

          <!-- Attendance History -->
          <div class="card border-0 shadow-sm mt-4">
            <div class="card-header bg-white py-3">
              <h6 class="fw-bold mb-0">Historique Récent</h6>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover table-nowrap mb-0">
                  <thead class="bg-light">
                    <tr>
                      <th>Date</th>
                      <th>Arrivée</th>
                      <th>Départ</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let a of history">
                      <td class="fw-medium">{{ a.date | date:'dd MMM yyyy' }}</td>
                      <td>{{ a.checkIn | date:'HH:mm' }}</td>
                      <td>{{ a.checkOut ? (a.checkOut | date:'HH:mm') : '--:--' }}</td>
                      <td>
                        <span class="badge" [ngClass]="a.checkOut ? 'bg-soft-success text-success' : 'bg-soft-warning text-warning'">
                          {{ a.checkOut ? 'Terminé' : 'En cours' }}
                        </span>
                      </td>
                    </tr>
                    <tr *ngIf="history.length === 0">
                      <td colspan="4" class="text-center py-4 text-muted">Aucun historique disponible.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bg-soft-success { background-color: rgba(40, 199, 111, 0.1); }
    .text-success { color: #28c76f !important; }
    .bg-soft-warning { background-color: rgba(255, 159, 67, 0.1); }
    .text-warning { color: #ff9f43 !important; }
  `]
})
export class AttendancePersonalComponent implements OnInit {
  history: any[] = [];

  constructor(
    private hrService: HrService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  loadHistory(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;
    
    this.hrService.getAttendanceByUserId(userId).subscribe({
      next: (data: any[]) => {
        this.history = data.slice(-10).reverse(); // Last 10 days
      },
      error: (err: any) => console.error('Error loading history', err)
    });
  }
}
