import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface User {
  id?: number;
  email: string;
  firstName?: string;
  lastName?: string;
  token?: string;
  roles?: string[];
}

export interface LoginResponse {
  token: string;
  type: string;
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  message?: string;
  error?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<LoginResponse> {
    console.log('🔵 Tentative de connexion pour:', email);

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        map(response => {
          console.log('🟢 Réponse du backend:', response);

          if (response.token) {
            // Stocker l'utilisateur dans localStorage
            const user: User = {
              id: response.id,
              email: response.email,
              firstName: response.firstName,
              lastName: response.lastName,
              token: response.token,
              roles: response.roles
            };

            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);
            console.log('✅ Utilisateur connecté:', user.email, 'Rôles:', user.roles);
          }

          return response;
        }),
        catchError(error => {
          console.error('🔴 Erreur de connexion:', error);

          let errorMessage = 'Erreur de connexion au serveur';

          if (error.status === 401) {
            errorMessage = 'Email ou mot de passe incorrect';
          } else if (error.status === 404) {
            errorMessage = 'Service non disponible';
          } else if (error.status === 500) {
            errorMessage = 'Erreur serveur interne';
          } else if (error.status === 0) {
            errorMessage = 'Impossible de contacter le serveur. Vérifiez que le backend est démarré sur http://localhost:8080';
          }

          return throwError(() => ({ message: errorMessage }));
        })
      );
  }

  register(userData: any): Observable<any> {
    console.log('🔵 Tentative d\'inscription pour:', userData.email);
    return this.http.post(`${this.apiUrl}/register`, userData)
      .pipe(
        map(response => {
          console.log('🟢 Réponse d\'inscription du backend:', response);
          return response;
        }),
        catchError(error => {
          console.error('🔴 Erreur d\'inscription:', error);
          let errorMessage = 'Erreur lors de l\'inscription';
          if (error.status === 400) {
            errorMessage = error.error?.message || 'Données invalides ou email déjà utilisé';
          } else if (error.status === 0) {
            errorMessage = 'Impossible de contacter le serveur';
          }
          return throwError(() => ({ message: errorMessage }));
        })
      );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserValue?.token;
  }

  getToken(): string | null {
    return this.currentUserValue?.token || null;
  }

  hasRole(roleName: string): boolean {
    const user = this.currentUserValue;
    const roles = user?.roles || [];
    const searchRole = roleName.toUpperCase();
    const hasRole = roles.some(r =>
      r.toUpperCase() === searchRole ||
      r.toUpperCase() === searchRole.replace('ROLE_', '')
    );
    console.log(`🔐 [AuthService] Vérif rôle: ${roleName} sur [${roles.join(', ')}] => ${hasRole}`);
    return hasRole;
  }

  isAdmin(): boolean {
    return this.hasRole('ROLE_ADMIN');
  }

  isTeamLeader(): boolean {
    return this.hasRole('ROLE_TEAM_LEADER');
  }

  isEmployee(): boolean {
    return this.hasRole('ROLE_EMPLOYEE') || this.hasRole('ROLE_Employee');
  }

  isCommercial(): boolean {
    return this.hasRole('ROLE_COMMERCIAL');
  }

  isClient(): boolean {
    return this.hasRole('ROLE_CLIENT');
  }

  isCommercialLeader(): boolean {
    return this.hasRole('ROLE_COMMERCIAL_LEADER');
  }

  /**
   * Check if user is authorized for a specific dashboard
   */
  isAuthorized(expectedRole: string): boolean {
    if (expectedRole === 'ROLE_ADMIN') return this.isAdmin();
    if (expectedRole === 'ROLE_TEAM_LEADER') return this.isTeamLeader();
    if (expectedRole === 'ROLE_EMPLOYEE' || expectedRole === 'ROLE_Employee') return this.isEmployee();
    if (expectedRole === 'ROLE_COMMERCIAL') return this.isCommercial() || this.isCommercialLeader();
    if (expectedRole === 'ROLE_CLIENT') return this.isClient();
    if (expectedRole === 'ROLE_COMMERCIAL_LEADER') return this.isCommercialLeader();
    return this.hasRole(expectedRole);
  }

  getUserId(): number | null {
    return this.currentUserValue?.id || null;
  }

  getUserName(): string | null {
    const user = this.currentUserValue;
    if (user && (user.firstName || user.lastName)) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return null;
  }

  getUserRoles(): string[] {
    return this.currentUserValue?.roles || [];
  }

  getUserRole(): string | null {
    const roles = this.getUserRoles();
    return roles.length > 0 ? roles[0] : null;
  }
}