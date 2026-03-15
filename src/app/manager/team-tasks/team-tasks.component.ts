import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ManagerService } from '../../services/manager.service';
import { AuthService } from '../../services/auth.service';
import { Task, User, Project } from '../../models/models';

@Component({
    selector: 'app-team-tasks',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './team-tasks.component.html',
    styleUrl: './team-tasks.component.css'
})
export class TeamTasksComponent implements OnInit {
    tasks: Task[] = [];
    employees: User[] = [];
    projects: Project[] = [];

    selectedProjectId?: number;
    isLoading = true;

    todoTasks: Task[] = [];
    inProgressTasks: Task[] = [];
    doneTasks: Task[] = [];

    // Create Task form
    newTask: any = { title: '', description: '', status: 'TODO', priority: 'MEDIUM', deadline: '' };
    selectedUserId?: number;

    // Edit Task
    editingTask: Task | null = null;

    constructor(
        private managerService: ManagerService,
        private authService: AuthService,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        const userId = this.authService.getUserId();
        if (userId) {
            this.managerService.getEmployees().subscribe(res => this.employees = res);
            this.managerService.getProjectsByUserId(userId).subscribe(res => {
                this.projects = res;
                // Auto-select from query param
                this.route.queryParams.subscribe(params => {
                    this.selectedProjectId = params['projectId'] ? +params['projectId'] : (res[0]?.id ?? undefined);
                    if (this.selectedProjectId) this.loadTasks();
                    else this.isLoading = false;
                });
            });
        }
    }

    loadTasks() {
        if (!this.selectedProjectId) { this.isLoading = false; return; }
        this.isLoading = true;
        this.managerService.getTasksByProjectId(this.selectedProjectId).subscribe({
            next: (res) => { this.tasks = res; this.organizeTasks(); this.isLoading = false; },
            error: () => this.isLoading = false
        });
    }

    organizeTasks() {
        this.todoTasks = this.tasks.filter(t => t.status === 'TODO');
        this.inProgressTasks = this.tasks.filter(t => t.status === 'IN_PROGRESS');
        this.doneTasks = this.tasks.filter(t => t.status === 'DONE' || t.status === 'COMPLETED');
    }

    createTask() {
        if (!this.selectedUserId || !this.newTask.title) {
            alert('Veuillez renseigner le titre et choisir un employé.');
            return;
        }
        const payload = { ...this.newTask, project: this.selectedProjectId ? { id: this.selectedProjectId } : null };
        this.managerService.addTaskToUser(+this.selectedUserId, payload).subscribe({
            next: () => { this.loadTasks(); this.resetForm(); },
            error: (err) => { console.error(err); alert('Erreur lors de la création.'); }
        });
    }

    openEditModal(task: Task) {
        this.editingTask = { ...task };
        this.newTask = {
            title: task.title,
            description: task.description || '',
            priority: task.priority,
            status: task.status,
            deadline: task.deadline ? new Date(task.deadline).toISOString().substring(0, 10) : ''
        };
        this.selectedUserId = task.users?.[0]?.id;
    }

    updateTask() {
        if (!this.editingTask?.id || !this.newTask.title) return;
        this.managerService.updateTask(this.editingTask.id, this.newTask).subscribe({
            next: () => { this.loadTasks(); this.resetForm(); },
            error: (err) => console.error(err)
        });
    }

    saveTask() {
        if (this.editingTask) this.updateTask();
        else this.createTask();
    }

    deleteTask(taskId?: number) {
        if (!taskId || !confirm('Supprimer cette tâche ?')) return;
        this.managerService.deleteTask(taskId).subscribe(() => this.loadTasks());
    }

    updateStatus(taskId: number, status: string) {
        this.managerService.updateTaskStatus(taskId, status).subscribe(() => this.loadTasks());
    }

    resetForm() {
        this.editingTask = null;
        this.newTask = { title: '', description: '', status: 'TODO', priority: 'MEDIUM', deadline: '' };
        this.selectedUserId = undefined;
    }

    getPriorityClass(priority: string): string {
        switch (priority) {
            case 'HIGH': return 'bg-danger';
            case 'MEDIUM': return 'bg-warning';
            case 'LOW': return 'bg-info';
            default: return 'bg-secondary';
        }
    }
}
