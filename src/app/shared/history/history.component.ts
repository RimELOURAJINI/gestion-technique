import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './history.component.html',
  styles: [`
    .history-card { transition: all 0.3s; border-radius: 15px; overflow: hidden; }
    .status-timeline { position: relative; padding-left: 30px; }
    .status-timeline::before { content: ''; position: absolute; left: 10px; top: 0; bottom: 0; width: 2px; background: #e2e8f0; }
    .timeline-item { position: relative; padding-bottom: 20px; }
    .timeline-dot { position: absolute; left: -25px; top: 5px; width: 12px; height: 12px; border-radius: 50%; background: #cbd5e1; border: 2px solid white; }
    .duration-badge { font-size: 11px; font-weight: bold; }
    .task-group { background: #f8fafc; border-radius: 10px; margin-bottom: 15px; }
    .project-header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 20px; border-radius: 15px 15px 0 0; }
  `]
})
export class HistoryComponent implements OnInit {
  projects: any[] = [];
  selectedProjectId: number | null = null;
  historyData: any = null; // Grouped by task title
  loading = false;
  private apiUrl = 'http://localhost:8081/api';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.http.get<any[]>(`${this.apiUrl}/projects`).subscribe(data => {
      this.projects = data.filter(p => p.status === 'COMPLETED' || p.status === 'DONE' || p.status === 'DELIVERED');
    });
  }

  loadHistory(projectId: number): void {
    this.loading = true;
    this.selectedProjectId = projectId;
    this.http.get<any>(`${this.apiUrl}/history/project/${projectId}`).subscribe({
      next: (data) => {
        this.historyData = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getTaskTitles(): string[] {
    return this.historyData ? Object.keys(this.historyData) : [];
  }

  getStatusClass(status: string): string {
    switch (status.toUpperCase()) {
      case 'TODO': return 'bg-secondary';
      case 'IN_PROGRESS': return 'bg-warning';
      case 'TEST': return 'bg-info';
      case 'DONE':
      case 'COMPLETED': return 'bg-success';
      default: return 'bg-dark';
    }
  }

  formatDuration(mins: number): string {
    if (!mins) return '0m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  getSelectedProjectName(): string {
    const p = this.projects.find(proj => proj.id === this.selectedProjectId);
    return p ? p.name : '';
  }
}
