import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();
  
  // Log pour voir les requêtes HTTP
  console.log(`🌐 Requête HTTP: ${req.method} ${req.url}`);
  
  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(cloned).pipe(
      catchError(error => {
        if (error.status === 401) {
          console.log('🔒 Token expiré ou invalide, déconnexion...');
          authService.logout();
          router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
  
  return next(req);
};