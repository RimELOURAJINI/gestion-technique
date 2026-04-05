import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { User, Task, Project } from '../../models/models';

@Component({
    selector: 'app-task-management',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './task-management.component.html',
    styleUrl: './task-management.component.css'
})
export class TaskManagementComponent implements OnInit {
    managers: User[] = [];
    projects: Project[] = [];
    tasks: Task[] = [];
    isLoading = true;

    editingTask: Task | null = null;
    newTask: any = { title: '', description: '', status: 'TODO', priority: 'MEDIUM', deadline: '', startDate: '', type: 'FEATURE', estimatedHours: 0, qualityScore: 0 };
    selectedManagerId: number | null = null;
    selectedProjectId: number | null = null;

    constructor(private adminService: AdminService) { }

    ngOnInit() {
        this.loadAll();
    }

    loadAll() {
        this.isLoading = true;
        // Load managers with correct role
        this.adminService.getUsersByRole('ROLE_TEAM_LEADER').subscribe({
            next: (res) => { this.managers = res; },
            error: (err) => console.error(err)
        });
        this.adminService.getAllProjects().subscribe({
            next: (res) => { this.projects = res; this.isLoading = false; },
            error: () => this.isLoading = false
        });
    }

    createTask() {
        if (!this.selectedManagerId || !this.newTask.title) {
            alert('Veuillez renseigner le titre et choisir un manager.');
            return;
        }

        const taskPayload: any = {
            ...this.newTask,
            project: this.selectedProjectId ? { id: this.selectedProjectId } : null,
            startDate: this.newTask.startDate || null,
        };

        // Ensure dates are null if empty string
        if (!taskPayload.deadline || taskPayload.deadline === '') {
            taskPayload.deadline = null;
        }
        if (!taskPayload.startDate || taskPayload.startDate === '') {
            taskPayload.startDate = null;
        }

        console.log("Creating task payload:", taskPayload);

        this.adminService.assignTaskToUser(+this.selectedManagerId, taskPayload).subscribe({
            next: () => {
                alert('Tâche assignée avec succès !');
                this.resetTaskForm();
            },
            error: (err) => { 
                console.error(err); 
                alert('Erreur lors de la création : ' + (err.error?.message || err.message)); 
            }
        });
    }

    deleteTask(taskId?: number) {
        if (!taskId || !confirm('Supprimer cette tâche ?')) return;
        this.adminService.deleteTask(taskId).subscribe({
            next: () => { /* tasks not shown in list currently */ },
            error: (err) => console.error(err)
        });
    }

    openEditTask(task: Task) {
        this.editingTask = task;
        this.newTask = { ...task, deadline: task.deadline ? new Date(task.deadline).toISOString().substring(0, 10) : '' };
    }

    resetTaskForm() {
        this.editingTask = null;
        this.newTask = { title: '', description: '', status: 'TODO', priority: 'MEDIUM', deadline: '', startDate: '', type: 'FEATURE', estimatedHours: 0, qualityScore: 0 };
        this.selectedManagerId = null;
        this.selectedProjectId = null;
    }

    getPriorityBadge(priority: string): string {
        switch (priority) {
            case 'HIGH': return 'bg-danger';
            case 'MEDIUM': return 'bg-warning';
            case 'LOW': return 'bg-info';
            default: return 'bg-secondary';
        }
    }

    getStatusBadge(status: string): string {
        switch (status) {
            case 'DONE': case 'COMPLETED': return 'bg-success';
            case 'IN_PROGRESS': return 'bg-warning';
            case 'TODO': return 'bg-secondary';
            default: return 'bg-secondary';
        }
    }
}
