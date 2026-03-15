// src/app/login/login.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';  // ← Ajout de la propriété manquante

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Initialisation du formulaire dans le constructeur
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Rediriger si déjà connecté
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/home']);
    }
  }

  onSubmit(): void {
    // CORRECTION: Vérifier si le formulaire est INVALIDE
    if (this.loginForm.invalid) {  // ← Changé de 'valid' à 'invalid'
      return;
    }

    this.loading = true;
    this.errorMessage = '';  // ← Utilisation de errorMessage au lieu de error

    const email = this.loginForm.get('email')?.value;
    const password = this.loginForm.get('password')?.value;

    this.authService.login(email, password).subscribe({
      next: (response) => {
        this.router.navigate(['/home']);  // ← CORRECTION: this.user → this.router
      },
      error: (error) => {
        this.errorMessage = 'Email ou mot de passe incorrect';  // ← errorMessage
        this.loading = false;
      }
    });
  }
}