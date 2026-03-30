import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="home-container">
      <header class="header">
        <h1>Bienvenue, {{ user?.firstName }} {{ user?.lastName }}!</h1>
        <button class="btn-logout" (click)="logout()">Déconnexion</button>
      </header>
      
      <main class="content">
        <div class="welcome-card">
          <h2>Connexion réussie!</h2>
          <p>Vous êtes maintenant connecté à votre application.</p>
          <p class="user-info">
            <strong>Email:</strong> {{ user?.email }}<br>
            <strong>Token:</strong> {{ user?.token?.substring(0,20) }}...
          </p>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .home-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .header {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      padding: 20px 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: white;
      border-bottom: 1px solid rgba(255,255,255,0.2);
    }
    .btn-logout {
      background: transparent;
      color: white;
      border: 2px solid white;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
    }
    .btn-logout:hover {
      background: white;
      color: #764ba2;
    }
    .content {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 80px);
      padding: 20px;
    }
    .welcome-card {
      background: white;
      border-radius: 15px;
      padding: 40px;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    }
    .welcome-card h2 {
      color: #333;
      margin-bottom: 20px;
    }
    .welcome-card p {
      color: #666;
      line-height: 1.6;
    }
    .user-info {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
      margin-top: 20px;
      font-family: monospace;
    }
  `]
})
export class HomeComponent implements OnInit {
  user: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.user = this.authService.currentUserValue;

    if (!this.user) {
      this.router.navigate(['/login']);
    } else {
      // Redirection automatique vers le dashboard selon le rôle
      this.redirectByRole();
    }
  }

  redirectByRole(): void {
    console.log('🔍 Vérification des rôles pour redirection...', this.user?.roles);
    if (this.authService.isAdmin()) {
      console.log('➔ Redirection vers /admin');
      this.router.navigate(['/admin']);
    } else if (this.authService.isTeamLeader()) {
      console.log('➔ Redirection vers /manager');
      this.router.navigate(['/manager']);
    } else if (this.authService.isEmployee()) {
      console.log('➔ Redirection vers /employee');
      this.router.navigate(['/employee']);
    } else {
      console.log('⚠️ Aucun rôle reconnu, retour au login');
      this.authService.logout();
    }
  }

  logout(): void {
    this.authService.logout();
  }
}