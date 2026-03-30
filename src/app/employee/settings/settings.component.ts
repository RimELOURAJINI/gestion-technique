import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-employee-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class EmployeeSettingsComponent {
  user: any;
  
  constructor(private authService: AuthService) {
    this.user = authService.currentUserValue;
  }

  logout() {
    this.authService.logout();
  }
}
