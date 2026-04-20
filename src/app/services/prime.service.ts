import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Prime, PrimeAffectation, AiBonusSuggestion } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class PrimeService {
  private apiUrl = 'http://localhost:8080/api/primes';
  
  private pendingCountSubject = new BehaviorSubject<number>(0);
  public pendingCount$ = this.pendingCountSubject.asObservable();

  constructor(private http: HttpClient) { }

  // Primes CRUD
  getPrimes(): Observable<Prime[]> {
    return this.http.get<Prime[]>(this.apiUrl);
  }

  getActivePrimes(): Observable<Prime[]> {
    return this.http.get<Prime[]>(`${this.apiUrl}/active`);
  }

  createPrime(prime: Prime): Observable<Prime> {
    return this.http.post<Prime>(this.apiUrl, prime);
  }

  updatePrime(id: number, prime: Prime): Observable<Prime> {
    return this.http.put<Prime>(`${this.apiUrl}/${id}`, prime);
  }

  deletePrime(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Affectations
  affectPrime(affectation: any): Observable<PrimeAffectation> {
    return this.http.post<PrimeAffectation>(`${this.apiUrl}/affectations`, affectation);
  }

  getAllAffectations(): Observable<PrimeAffectation[]> {
    return this.http.get<PrimeAffectation[]>(`${this.apiUrl}/affectations`);
  }

  getMyAffectations(userId: number): Observable<PrimeAffectation[]> {
    return this.http.get<PrimeAffectation[]>(`${this.apiUrl}/affectations/my?userId=${userId}`);
  }

  updateAffectationStatus(id: number, status: string): Observable<PrimeAffectation> {
    return this.http.put<PrimeAffectation>(`${this.apiUrl}/affectations/${id}/status?status=${status}`, {});
  }

  // Badges
  refreshPendingCount(): void {
    this.http.get<number>(`${this.apiUrl}/affectations/pending-count`).subscribe(count => {
      this.pendingCountSubject.next(count);
    });
  }

  // AI Suggestions
  getAiSuggestions(): Observable<AiBonusSuggestion[]> {
    return this.http.get<AiBonusSuggestion[]>(`${this.apiUrl}/ai-suggestions`);
  }
}
