// home/home.ts (corrigé)
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {  // ← Exportez avec ce nom
  user: any;

  constructor(
    private authService: AuthService,  // ← Injection correcte
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.currentUserValue;
    
    // Si pas d'utilisateur, rediriger vers login
    if (!this.user) {
      this.router.navigate(['/login']);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}