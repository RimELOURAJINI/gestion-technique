import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { Task, Reclamation } from '../../models/models';

@Component({
  selector: 'app-my-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-tasks.component.html',
  styleUrl: './my-tasks.component.css'
})
export class MyTasksComponent implements OnInit {
  tasks: Task[] = [];
  groupedTasks: { [projectName: string]: Task[] } = {};
  projectNames: string[] = [];

  // For Ticket Modal
  selectedTaskForTicket: Task | null = null;
  ticketMessage: string = '';

  // For Date Modal
  selectedTaskForDates: Task | null = null;
  manualStartDate: string = '';
  manualEndDate: string = '';

  constructor(
    private employeeService: EmployeeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.employeeService.getMyTasks(userId).subscribe(
        res => {
          this.tasks = res;
          this.groupTasks();
        },
        (err: any) => console.error('Error loading tasks', err)
      );
    }
  }

  groupTasks(): void {
    this.groupedTasks = {};
    this.tasks.forEach(task => {
      const projectName = task.project ? task.project.name : 'Autres Tâches';
      if (!this.groupedTasks[projectName]) {
        this.groupedTasks[projectName] = [];
      }
      this.groupedTasks[projectName].push(task);
    });
    this.projectNames = Object.keys(this.groupedTasks);
  }

  startTask(taskId: number): void {
    this.employeeService.startTask(taskId).subscribe(() => this.loadTasks());
  }

  endTask(taskId: number): void {
    this.employeeService.endTask(taskId).subscribe(() => this.loadTasks());
  }

  openTicketModal(task: Task): void {
    this.selectedTaskForTicket = task;
    this.ticketMessage = '';
  }

  sendTicket(): void {
    if (!this.selectedTaskForTicket || !this.selectedTaskForTicket.id || !this.ticketMessage) return;
    
    const userId = this.authService.getUserId();
    if (!userId) return;

    const reclamation: Reclamation = {
      message: this.ticketMessage,
      status: 'Pending'
    };

    this.employeeService.sendBlockingTicket(userId, this.selectedTaskForTicket.id, reclamation).subscribe(
      () => {
        alert('Ticket envoyé avec succès !');
        this.selectedTaskForTicket = null;
      },
      (err: any) => console.error('Error sending ticket', err)
    );
  }

  openDateModal(task: Task): void {
    this.selectedTaskForDates = task;
    this.manualStartDate = task.actualStartTime ? new Date(task.actualStartTime).toISOString().substring(0, 16) : '';
    this.manualEndDate = task.actualEndTime ? new Date(task.actualEndTime).toISOString().substring(0, 16) : '';
  }

  updateTaskDates(): void {
    if (!this.selectedTaskForDates || !this.selectedTaskForDates.id) return;

    const start = this.manualStartDate ? new Date(this.manualStartDate).getTime() : null;
    const end = this.manualEndDate ? new Date(this.manualEndDate).getTime() : null;

    this.employeeService.updateTaskDates(this.selectedTaskForDates.id, start, end).subscribe(
      () => {
        alert('Dates mises à jour avec succès !');
        this.loadTasks();
      },
      (err: any) => console.error('Error updating dates', err)
    );
  }
}
