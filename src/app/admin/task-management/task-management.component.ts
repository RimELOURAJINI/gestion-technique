import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { AdminService } from '../../services/admin.service';
import { User, Task, Project } from '../../models/models';
import { AuthService } from '../../services/auth.service';
import { TaskDetailComponent } from '../../shared/task-detail/task-detail.component';
import { NotesPanelComponent } from '../../shared/notes-panel/notes-panel.component';
import { ProjectSupportModalComponent } from '../../shared/project-support-modal/project-support-modal.component';

@Component({
    selector: 'app-task-management',
    standalone: true,
    imports: [CommonModule, FormsModule, DragDropModule, TaskDetailComponent, NotesPanelComponent, ProjectSupportModalComponent],
    templateUrl: './task-management.component.html',
    styleUrl: './task-management.component.css'
})
export class TaskManagementComponent implements OnInit {
    managers: User[] = [];
    allUsers: User[] = [];
    projects: Project[] = [];
    tasks: Task[] = [];
    isLoading = true;
    activeTab: 'kanban' | 'assignment' = 'kanban';

    // Kanban columns
    todoTasks: Task[] = [];
    inProgressTasks: Task[] = [];
    testTasks: Task[] = [];
    doneTasks: Task[] = [];

    editingTask: Task | null = null;
    selectedTaskId: number | null = null;
    notesTaskId: number | null = null;
    newTask: any = { title: '', description: '', status: 'TODO', priority: 'MEDIUM', deadline: '', startDate: '', type: 'FEATURE', estimatedHours: 0, qualityScore: 0 };
    selectedManagerId: number | null = null;
    selectedProjectId: number | null = null;
    filterProjectId: number | 'ALL' = 'ALL';

    // Support Modal
    showSupportModal = false;
    selectedSupportTask: Task | null = null;

    constructor(
        private adminService: AdminService,
        private route: ActivatedRoute,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            if (params['projectId']) {
                this.filterProjectId = +params['projectId'];
            }
            this.loadAll();
        });
    }

    loadAll() {
        this.isLoading = true;
        const currentUserId = this.authService.getUserId();
        this.adminService.getUsersByRole('ROLE_TEAM_LEADER').subscribe(res => this.managers = res);
        this.adminService.getAllUsers().subscribe(res => {
            this.allUsers = res.users ? res.users : res;
        });
        const cUserId = currentUserId || undefined;
        this.adminService.getAllProjects(cUserId).subscribe(res => this.projects = res);
        
        if (this.filterProjectId === 'ALL') {
            this.loadTasks();
        } else {
            this.loadTasks(this.filterProjectId as number);
        }
    }

    loadTasks(projectId?: number) {
        this.isLoading = true;
        const currentUserId = this.authService.getUserId() || undefined;
        const taskObservable = projectId 
            ? this.adminService.getTasksByProjectId(projectId, currentUserId) 
            : this.adminService.getAllTasks(currentUserId);

        taskObservable.subscribe({
            next: (res) => {
                this.tasks = res;
                this.refreshKanban();
                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }

    onFilterChange() {
        if (this.filterProjectId === 'ALL') {
            this.loadTasks();
        } else {
            this.loadTasks(this.filterProjectId as number);
        }
    }

    refreshKanban() {
        // No client-side filtering needed anymore as we fetch from backend,
        // but we keep the method for splitting tasks into columns.
        this.todoTasks = this.tasks.filter(t => t.status === 'TODO' || !t.status);
        this.inProgressTasks = this.tasks.filter(t => t.status === 'IN_PROGRESS');
        this.testTasks = this.tasks.filter(t => t.status === 'TEST');
        this.doneTasks = this.tasks.filter(t => t.status === 'DONE' || t.status === 'COMPLETED');
    }

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
                this.adminService.updateTask(task.id, { ...task, status: newStatus }).subscribe();
            }
        }
    }

    createTask() {
        if (!this.selectedManagerId || !this.newTask.title) {
            alert('Veuillez renseigner le titre et choisir un utilisateur.');
            return;
        }

        const taskPayload: any = {
            ...this.newTask,
            project: this.selectedProjectId ? { id: this.selectedProjectId } : null,
        };

        this.adminService.assignTaskToUser(+this.selectedManagerId, taskPayload).subscribe({
            next: () => {
                alert('Tâche assignée avec succès !');
                this.loadTasks();
                this.resetTaskForm();
            },
            error: (err) => alert('Erreur lors de la création : ' + (err.error?.message || err.message))
        });
    }

    deleteTask(taskId?: number) {
        if (!taskId || !confirm('Supprimer cette tâche ?')) return;
        this.adminService.deleteTask(taskId).subscribe(() => this.loadTasks());
    }

    openEditTask(task: Task) {
        this.editingTask = task;
        this.newTask = { ...task, deadline: task.deadline ? new Date(task.deadline).toISOString().substring(0, 10) : '' };
        this.selectedManagerId = (task as any).users && (task as any).users.length > 0 ? (task as any).users[0].id : null;
        this.selectedProjectId = task.project ? task.project.id : null;
    }

    saveUpdate() {
        if (!this.editingTask || !this.editingTask.id) return;
        const payload = {
            ...this.newTask,
            project: this.selectedProjectId ? { id: this.selectedProjectId } : null
        };
        this.adminService.updateTask(this.editingTask.id, payload).subscribe(() => {
            this.loadTasks();
            this.resetTaskForm();
        });
    }

    openTaskDetail(task: Task) {
        this.selectedTaskId = task.id || null;
    }

    openNotes(task: Task, event: Event) {
        event.stopPropagation();
        this.notesTaskId = task.id || null;
    }

    closeNotes() {
        this.notesTaskId = null;
        this.loadTasks(this.filterProjectId === 'ALL' ? undefined : this.filterProjectId as number);
    }

    openSupportModal(task: Task, event: Event) {
        event.stopPropagation();
        this.selectedSupportTask = task;
        this.showSupportModal = true;
    }

    closeSupportModal() {
        this.showSupportModal = false;
        this.selectedSupportTask = null;
        this.loadTasks(this.filterProjectId === 'ALL' ? undefined : this.filterProjectId as number);
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
            case 'MEDIUM': return 'bg-warning text-dark';
            case 'LOW': return 'bg-info';
            default: return 'bg-secondary';
        }
    }
}
