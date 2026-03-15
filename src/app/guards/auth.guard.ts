import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log(`🛡️ [AuthGuard] Tentative d'accès à: ${state.url}`);
    if (this.authService.isAuthenticated()) {
      const expectedRole = route.data['expectedRole'];
      console.log(`🛡️ [AuthGuard] Rôle attendu: ${expectedRole}`);

      if (!expectedRole || this.authService.isAuthorized(expectedRole)) {
        console.log('🛡️ [AuthGuard] Accès AUTORISÉ');
        return true;
      }

      console.warn('🛡️ [AuthGuard] Accès REFUSÉ (Rôle incorrect). Redirection vers /login');
      this.router.navigate(['/login']);
      return false;
    }

    console.warn('🛡️ [AuthGuard] Non authentifié. Redirection vers /login');
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}