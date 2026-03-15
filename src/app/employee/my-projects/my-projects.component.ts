import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { Project } from '../../models/models';

@Component({
  selector: 'app-my-projects',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-projects.component.html',
  styleUrl: './my-projects.component.css'
})
export class MyProjectsComponent implements OnInit {
  projects: Project[] = [];
  ongoingProjects: Project[] = [];
  historicalProjects: Project[] = [];
  activeTab: 'ongoing' | 'history' = 'ongoing';

  constructor(
    private employeeService: EmployeeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.employeeService.getMyProjects(userId).subscribe(
        (res: Project[]) => {
          this.projects = res;
          this.ongoingProjects = res.filter(p => p.status !== 'COMPLETED');
          this.historicalProjects = res.filter(p => p.status === 'COMPLETED');
        },
        (err: any) => console.error('Error loading projects', err)
      );
    }
  }

  setTab(tab: 'ongoing' | 'history'): void {
    this.activeTab = tab;
  }
}
