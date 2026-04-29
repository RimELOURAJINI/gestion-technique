import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { SearchService } from '../../services/search.service';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-global-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div *ngIf="isOpen" class="modal-backdrop fade show" (click)="close()"></div>
    <div *ngIf="isOpen" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div class="modal-header bg-light border-0 py-3">
            <div class="input-group input-group-lg border-0 shadow-none">
              <span class="input-group-text bg-transparent border-0 pe-0">
                <i class="ti ti-search fs-20 text-muted"></i>
              </span>
              <input type="text" 
                     class="form-control bg-transparent border-0 shadow-none fs-16" 
                     placeholder="Rechercher projets, tâches, membres... (ESC pour fermer)" 
                     [(ngModel)]="query" 
                     (ngModelChange)="onQueryChange()"
                     #searchInput>
            </div>
          </div>
          <div class="modal-body p-0" style="max-height: 400px; overflow-y: auto;">
            <div *ngIf="isLoading" class="p-5 text-center">
              <div class="spinner-border text-primary" role="status"></div>
              <p class="text-muted mt-2">Recherche en cours...</p>
            </div>
            
            <div *ngIf="!isLoading && results.length > 0" class="list-group list-group-flush">
              <div *ngFor="let res of results" 
                   (click)="navigate(res)"
                   class="list-group-item list-group-item-action border-0 px-4 py-3 d-flex align-items-center cursor-pointer">
                <div class="avatar avatar-md bg-soft-primary rounded-circle me-3">
                  <i [class]="'ti ' + res.icon + ' text-primary fs-18'"></i>
                </div>
                <div class="flex-fill">
                  <h6 class="mb-0 fw-bold">{{ res.title }}</h6>
                  <small class="text-muted text-uppercase fs-10">{{ res.type }}</small>
                </div>
                <i class="ti ti-chevron-right text-muted"></i>
              </div>
            </div>

            <div *ngIf="!isLoading && query.length >= 2 && results.length === 0" class="p-5 text-center">
              <i class="ti ti-search-off fs-40 text-muted mb-2"></i>
              <p class="text-muted">Aucun résultat trouvé pour "{{ query }}"</p>
            </div>

            <div *ngIf="query.length < 2" class="p-4">
              <h6 class="text-muted fs-11 text-uppercase fw-bold mb-3">Recherches suggérées</h6>
              <div class="d-flex flex-wrap gap-2">
                <span class="badge bg-light text-dark px-3 py-2 cursor-pointer" (click)="setQuery('Projet')">#projets</span>
                <span class="badge bg-light text-dark px-3 py-2 cursor-pointer" (click)="setQuery('Tâche')">#tâches</span>
                <span class="badge bg-light text-dark px-3 py-2 cursor-pointer" (click)="setQuery('Réclamation')">#réclamations</span>
              </div>
            </div>
          </div>
          <div class="modal-footer bg-light border-0 py-2 justify-content-start">
            <small class="text-muted">
              <span class="badge bg-white text-dark border shadow-sm me-1">↑↓</span> Naviguer 
              <span class="badge bg-white text-dark border shadow-sm ms-2 me-1">Enter</span> Sélectionner
              <span class="badge bg-white text-dark border shadow-sm ms-2 me-1">ESC</span> Fermer
            </small>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop { z-index: 1050; background-color: rgba(0,0,0,0.5); backdrop-filter: blur(4px); }
    .modal { z-index: 1051; }
    .cursor-pointer { cursor: pointer; }
    .list-group-item:hover { background-color: #f8fafc; }
  `]
})
export class GlobalSearchComponent implements OnInit {
  isOpen = false;
  query = '';
  results: any[] = [];
  isLoading = false;
  private searchSubject = new Subject<string>();

  constructor(private searchService: SearchService, private router: Router) {}

  ngOnInit() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(q => this.performSearch(q));
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.toggle();
    }
    if (event.key === 'Escape' && this.isOpen) {
      this.close();
    }
  }

  toggle() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.query = '';
      this.results = [];
      setTimeout(() => {
        const input = document.querySelector('input[placeholder*="Rechercher"]') as HTMLInputElement;
        input?.focus();
      }, 100);
    }
  }

  close() {
    this.isOpen = false;
  }

  onQueryChange() {
    this.searchSubject.next(this.query);
  }

  setQuery(q: string) {
    this.query = q;
    this.onQueryChange();
  }

  private performSearch(q: string) {
    if (q.length < 2) {
      this.results = [];
      return;
    }
    this.isLoading = true;
    this.searchService.globalSearch(q).subscribe({
      next: (res) => {
        this.results = res;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  navigate(res: any) {
    this.close();
    if (res.url) {
        this.router.navigate([res.url]);
    }
  }
}
