import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimeService } from '../../services/prime.service';
import { AuthService } from '../../services/auth.service';
import { PrimeAffectation } from '../../models/models';

@Component({
  selector: 'app-my-primes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-primes.component.html',
  styleUrls: ['./my-primes.component.css']
})
export class MyPrimesComponent implements OnInit {
  affectations: PrimeAffectation[] = [];
  loading = true;

  constructor(
    private primeService: PrimeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.primeService.getMyAffectations(userId).subscribe(data => {
        this.affectations = data;
        this.loading = false;
      });
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'EN_ATTENTE': return 'bg-warning-light';
      case 'VALIDÉE': return 'bg-info-light';
      case 'PAYÉE': return 'bg-success-light';
      default: return 'bg-secondary-light';
    }
  }
}
