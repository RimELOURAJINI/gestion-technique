import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { Project, Task } from '../../models/models';

@Component({
  selector: 'app-employee-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './employee-home.component.html',
  styleUrl: './employee-home.component.css'
})
export class EmployeeHomeComponent implements OnInit {
  stats = {
    myProjects: 0,
    activeTasks: 0,
    completedTasks: 0
  };
  upcomingTasks: Task[] = [];
  myProjects: Project[] = [];
  isLoading = true;

  constructor(
    private employeeService: EmployeeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.isLoading = true;
      
      this.employeeService.getMyProjects(userId).subscribe(projects => {
        this.myProjects = projects;
        this.stats.myProjects = projects.length;
      });

      this.employeeService.getMyTasks(userId).subscribe(tasks => {
        this.stats.activeTasks = tasks.filter(t => t.status !== 'COMPLETED').length;
        this.stats.completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
        
        // Sorting by deadline and taking first 5
        this.upcomingTasks = tasks
          .filter(t => t.status !== 'COMPLETED' && t.deadline)
          .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
          .slice(0, 5);
          
        this.isLoading = false;
      });
    }
  }
}