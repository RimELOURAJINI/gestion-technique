import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AdminService } from '../../services/admin.service';
import { Project } from '../../models/models';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './client-dashboard.component.html',
  styleUrl: './client-dashboard.component.css'
})
export class ClientDashboardComponent implements OnInit {
  clientName = '';

  constructor(
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.clientName = localStorage.getItem('userName') || 'Client';
  }

  logout() {
    this.authService.logout();
  }
}
