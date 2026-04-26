import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { EmployeeService } from '../../services/employee.service';
import { AuthService } from '../../services/auth.service';
import { Project, Task, Reclamation, SubTask } from '../../models/models';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-my-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DragDropModule],
  templateUrl: './my-tasks.component.html',
  styleUrl: './my-tasks.component.css'
})
export class MyTasksComponent implements OnInit {
  tasks: Task[] = [];
  groupedTasks: { [projectName: string]: Task[] } = {};
  projectNames: string[] = [];
  currentFilter: string = '';
  allProjects: Project[] = [];
  viewMode: 'table' | 'kanban' = 'kanban';
  kanbanColumns = ['TODO', 'IN_PROGRESS', 'TEST', 'DONE'];

  todoTasks: Task[] = [];
  inProgressTasks: Task[] = [];
  testTasks: Task[] = [];
  doneTasks: Task[] = [];

  onDrop(event: CdkDragDrop<Task[]>, newStatus: string) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const task = event.previousContainer.data[event.previousIndex];
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      if (task.id) {
        this.employeeService.updateTaskStatus(task.id, newStatus).subscribe(() => this.loadTasks());
      }
    }
  }

  getDuration(task: Task): string {
    if (!task.actualStartTime) return '';
    const end = task.actualEndTime ? new Date(task.actualEndTime) : new Date();
    const start = new Date(task.actualStartTime);
    const diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) return '0m';
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}j ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  }

  // Create/Edit Task
  taskForm: any = {
    id: null,
    title: '',
    description: '',
    priority: 'MEDIUM',
    deadline: '',
    projectId: null,
    type: 'FEATURE',
    estimatedHours: 0,
    actualHours: 0,
    storyPoints: 3,
    qualityScore: 0
  };
  editMode: boolean = false;

  // Interaction

  // For Ticket Modal
  selectedTaskForTicket: Task | null = null;
  ticketMessage: string = '';

  // For Date Modal
  selectedTaskForDates: Task | null = null;
  manualStartDate: string = '';
  manualEndDate: string = '';

  constructor(
    private employeeService: EmployeeService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.currentFilter = params['filter'] || '';
      this.loadTasks();
      this.loadProjects();
    });
  }

  loadProjects(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.employeeService.getMyProjects(userId).subscribe(
        res => this.allProjects = res,
        err => console.error('Error loading projects', err)
      );
    }
  }

  loadTasks(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.employeeService.getMyTasks(userId).subscribe(
        res => {
          // Restore saved subtasks from localStorage
          const saved: { [id: number]: SubTask[] } = JSON.parse(localStorage.getItem('task_subtasks') || '{}');
          this.tasks = res.map(t => ({
            ...t,
            subtasks: t.id && saved[t.id] ? saved[t.id] : []
          }));
          this.groupTasks();
        },
        (err: any) => console.error('Error loading tasks', err)
      );
    }
  }

  groupTasks(): void {
    this.groupedTasks = {};
    const today = new Date().toISOString().split('T')[0];

    let filteredTasks = this.tasks;

    if (this.currentFilter === 'today') {
      filteredTasks = this.tasks.filter(t => {
        return t.status !== 'DONE' && t.status !== 'COMPLETED';
      });
    } else if (this.currentFilter === 'subtasks') {
      // In this mode, we show tasks that have subtasks, or maybe we want a different display.
      // For now, let's just filter tasks that have at least one subtask.
      filteredTasks = this.tasks.filter(t => t.subtasks && t.subtasks.length > 0);
    }

    filteredTasks.forEach(task => {
      const projectName = task.project ? task.project.name : 'Autres Tâches';
      if (!this.groupedTasks[projectName]) {
        this.groupedTasks[projectName] = [];
      }
      this.groupedTasks[projectName].push(task);
    });
    this.projectNames = Object.keys(this.groupedTasks);

    // populate kanban arrays for CDK DND
    this.todoTasks = filteredTasks.filter(t => t.status === 'TODO' || t.status === 'NEW' || t.status === 'PENDING' || !t.status);
    this.inProgressTasks = filteredTasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'DOING');
    this.testTasks = filteredTasks.filter(t => t.status === 'TEST' || t.status === 'REVIEW');
    this.doneTasks = filteredTasks.filter(t => t.status === 'DONE' || t.status === 'COMPLETED' || t.status === 'FINISHED');
  }

  // ===== DETAIL MODAL =====
  openTaskDetail(task: Task): void {
    if (task.id) {
      this.router.navigate(['/employee/tasks', task.id]);
    }
  }

  toggleView(mode: 'table' | 'kanban'): void {
    this.viewMode = mode;
  }

  // ===== STATUS UPDATES =====
  startTask(taskId: number): void {
    this.employeeService.startTask(taskId).subscribe(() => this.loadTasks());
  }

  endTask(taskId: number): void {
    this.employeeService.endTask(taskId).subscribe(() => this.loadTasks());
  }

  // ===== TICKET MODAL =====
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
      status: 'PENDING'
    };

    this.employeeService.sendBlockingTicket(userId, this.selectedTaskForTicket.id, reclamation).subscribe(
      () => {
        alert('Ticket envoyé avec succès !');
        this.selectedTaskForTicket = null;
      },
      (err: any) => console.error('Error sending ticket', err)
    );
  }

  // ===== DATES MODAL =====
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

  // ===== TASK CRUD =====
  openCreateModal(): void {
    this.editMode = false;
    this.taskForm = {
      id: null,
      title: '',
      description: '',
      priority: 'MEDIUM',
      deadline: '',
      projectId: null,
      type: 'FEATURE',
      estimatedHours: 0,
      actualHours: 0,
      storyPoints: 3,
      qualityScore: 0
    };
  }

  openEditModal(task: Task): void {
    this.editMode = true;
    this.taskForm = {
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      deadline: task.deadline ? new Date(task.deadline).toISOString().substring(0, 10) : '',
      projectId: task.project ? task.project.id : null,
      type: task.type || 'FEATURE',
      estimatedHours: task.estimatedHours || 0,
      actualHours: task.actualHours || 0,
      storyPoints: task.storyPoints || 3,
      qualityScore: task.qualityScore || 0
    };
  }

  saveTask(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;

    const taskData: any = {
      title: this.taskForm.title,
      description: this.taskForm.description,
      priority: this.taskForm.priority,
      deadline: this.taskForm.deadline || undefined,
      type: this.taskForm.type,
      estimatedHours: this.taskForm.estimatedHours,
      actualHours: this.taskForm.actualHours,
      qualityScore: this.taskForm.qualityScore,
      status: this.editMode ? undefined : 'TODO'
    };

    if (this.taskForm.projectId) {
      taskData.project = { id: this.taskForm.projectId } as any;
    }

    if (this.editMode && this.taskForm.id) {
      this.employeeService.updateTask(this.taskForm.id, taskData).subscribe(
        () => {
          this.loadTasks();
          this.closeModal('taskModal');
        },
        err => console.error('Error updating task', err)
      );
    } else {
      this.employeeService.createTask(userId, taskData).subscribe(
        () => {
          this.loadTasks();
          this.closeModal('taskModal');
        },
        err => console.error('Error creating task', err)
      );
    }
  }

  confirmDeleteTask(task: Task): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la tâche "${task.title}" ?`)) {
      if (task.id) {
        this.employeeService.deleteTask(task.id).subscribe(
          () => {
            this.loadTasks();
          },
          err => console.error('Error deleting task', err)
        );
      }
    }
  }

  private closeModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      const closeBtn = modalElement.querySelector('[data-bs-dismiss="modal"]') as HTMLElement;
      if (closeBtn) closeBtn.click();
    }
  }

  // ===== HELPERS =====
  getStatusClass(s: string): string {
    if (s === 'DONE' || s === 'COMPLETED') return 'bg-success';
    if (s === 'IN_PROGRESS') return 'bg-warning text-dark';
    return 'bg-secondary';
  }

  getStatusLabel(s: string): string {
    if (s === 'DONE' || s === 'COMPLETED') return 'Terminée';
    if (s === 'IN_PROGRESS') return 'En cours';
    return 'À faire';
  }

  getPriorityClass(p: string): string {
    if (p === 'HIGH') return 'bg-danger';
    if (p === 'MEDIUM') return 'bg-warning text-dark';
    return 'bg-success';
  }

  getCompletedSubtasksCount(task: Task): number {
    return task.subtasks?.filter(s => s.done).length || 0;
  }
}
