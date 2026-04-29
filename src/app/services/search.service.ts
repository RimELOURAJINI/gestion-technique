import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface SearchResult {
  id: number;
  title: string;
  type: 'Project' | 'User';
  icon: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  private searchUrl = 'http://localhost:8080/api/search';

  constructor(private http: HttpClient) {}

  globalSearch(query: string): Observable<SearchResult[]> {
    if (!query || query.trim().length < 2) return of([]);
    return this.http.get<SearchResult[]>(`${this.searchUrl}?q=${encodeURIComponent(query)}`);
  }
}
