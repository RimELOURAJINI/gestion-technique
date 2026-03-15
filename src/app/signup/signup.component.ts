import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  userData = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (this.userData.password !== this.userData.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { confirmPassword, ...registerData } = this.userData;

    this.authService.register(registerData).subscribe({
      next: (response) => {
        console.log('✅ Inscription réussie!', response);
        this.successMessage = 'Inscription réussie! Redirection vers la page de connexion...';
        this.loading = false;
        
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        console.error('❌ Échec d\'inscription:', error);
        this.errorMessage = error.message || 'Une erreur est survenue lors de l\'inscription';
        this.loading = false;
      }
    });
  }
}
