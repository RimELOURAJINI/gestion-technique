import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isAuthenticated()) {
      this.redirectByRole();
    }
  }

  redirectByRole(): void {
    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin']);
    } else if (this.authService.isTeamLeader()) {
      this.router.navigate(['/manager']);
    } else if (this.authService.isEmployee()) {
      this.router.navigate(['/employee']);
    } else if (this.authService.isCommercial()) {
      this.router.navigate(['/commercial']);
    } else if (this.authService.isClient()) {
      this.router.navigate(['/client']);
    } else {
      this.router.navigate(['/home']);
    }
  }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('✅ Connexion réussie!', response);
        this.successMessage = 'Connexion réussie! Redirection...';
        this.loading = false;

        // Redirect based on role
        setTimeout(() => {
          this.redirectByRole();
        }, 800);
      },
      error: (error) => {
        console.error('❌ Échec de connexion:', error);
        this.errorMessage = error.message || 'Email ou mot de passe incorrect';
        this.loading = false;
      }
    });
  }
}