import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrimeService } from '../../services/prime.service';
import { AdminService } from '../../services/admin.service';
import { Prime, PrimeAffectation, User, AiBonusSuggestion } from '../../models/models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-primes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './primes.component.html',
  styleUrl: './primes.component.css'
})
export class AdminPrimesComponent implements OnInit {
  activeTab: 'manage' | 'affect' | 'history' = 'manage';
  
  // Manage Tab
  primes: Prime[] = [];
  newPrime: Prime = { name: '', description: '', amount: 0, type: 'PERFORMANCE', period: 'MENSUELLE' };
  isEditingPrime = false;

  // Affect Tab
  users: User[] = [];
  activePrimes: Prime[] = [];
  newAffectation = { userId: '', primeId: '', justification: '' };
  aiSuggestions: AiBonusSuggestion[] = [];
  isAskingAi = false;

  // History Tab
  affectations: PrimeAffectation[] = [];
  filters = { role: '', status: '', user: '' };

  constructor(
    private primeService: PrimeService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    forkJoin({
      primes: this.primeService.getPrimes(),
      users: this.adminService.getAllUsers(),
      affectations: this.primeService.getAllAffectations()
    }).subscribe(data => {
      this.primes = data.primes;
      this.activePrimes = data.primes.filter(p => p.status === 'ACTIVE');
      this.users = data.users.filter((u: any) => !u.roles.some((r: any) => r.name === 'ROLE_CLIENT' || r.name === 'ROLE_ADMIN'));
      this.affectations = data.affectations;
    });
  }

  // Manage logic
  savePrime(): void {
    if (this.isEditingPrime && this.newPrime.id) {
      this.primeService.updatePrime(this.newPrime.id, this.newPrime).subscribe(() => {
        this.resetPrimeForm();
        this.loadData();
      });
    } else {
      this.primeService.createPrime(this.newPrime).subscribe(() => {
        this.resetPrimeForm();
        this.loadData();
      });
    }
  }

  editPrime(prime: Prime): void {
    this.newPrime = { ...prime };
    this.isEditingPrime = true;
    this.activeTab = 'manage';
  }

  deletePrime(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer cette prime ?')) {
      this.primeService.deletePrime(id).subscribe(() => this.loadData());
    }
  }

  resetPrimeForm(): void {
    this.newPrime = { name: '', description: '', amount: 0, type: 'PERFORMANCE', period: 'MENSUELLE' };
    this.isEditingPrime = false;
  }

  // Affect logic
  askAi(): void {
    this.isAskingAi = true;
    this.primeService.getAiSuggestions().subscribe(suggestions => {
      this.aiSuggestions = suggestions;
      this.isAskingAi = false;
    });
  }

  selectSuggestedUser(userId: number, justification: string): void {
    this.newAffectation.userId = userId.toString();
    this.newAffectation.justification = justification;
  }

  submitAffectation(): void {
    const payload = {
      user: { id: +this.newAffectation.userId },
      prime: { id: +this.newAffectation.primeId },
      justification: this.newAffectation.justification
    };
    this.primeService.affectPrime(payload).subscribe(() => {
      alert('Prime affectée avec succès !');
      this.newAffectation = { userId: '', primeId: '', justification: '' };
      this.aiSuggestions = [];
      this.loadData();
    });
  }

  // History logic
  updateStatus(id: number, status: string): void {
    this.primeService.updateAffectationStatus(id, status).subscribe(() => this.loadData());
  }

  get filteredAffectations(): PrimeAffectation[] {
    return this.affectations.filter(a => {
      const matchRole = !this.filters.role || a.user.roles[0].name === this.filters.role;
      const matchStatus = !this.filters.status || a.status === this.filters.status;
      const matchUser = !this.filters.user || (a.user.firstName + ' ' + a.user.lastName).toLowerCase().includes(this.filters.user.toLowerCase());
      return matchRole && matchStatus && matchUser;
    });
  }
}
