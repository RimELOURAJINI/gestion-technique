import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './employee-dashboard.component.html',
  styleUrls: ['./employee-dashboard.component.css']
})
export class EmployeeDashboardComponent implements OnInit {
  employeeName: string = '';
  employeeRole: string = '';
  employeeInitials: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    this.employeeName = `${firstName} ${lastName}`.trim() || 'Employé';
    this.employeeRole = user.roles ? user.roles[0] : 'Employé';
    const parts = this.employeeName.split(' ');
    this.employeeInitials = parts.map((p: string) => p[0]).join('').toUpperCase().substring(0, 2);
  }

  logout(): void {
    this.authService.logout();
  }
}