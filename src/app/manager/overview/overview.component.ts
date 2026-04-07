import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamLeaderService } from '../../services/manager.service';
import { AuthService } from '../../services/auth.service';
import { Project, Task, User } from '../../models/models';
import { RouterLink } from '@angular/router';
import { AiService } from '../../services/ai.service';

declare var initDashboardCharts: any;

@Component({
  selector: 'app-manager-overview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class ManagerOverviewComponent implements OnInit, AfterViewInit {
  stats = {
    projects: 0,
    activeTasks: 0,
    completedTasks: 0,
    teamMembers: 0
  };
  today: Date = new Date();
  myProjects: Project[] = [];
  recentTasks: Task[] = [];
  isLoading = true;

  isAiLoading = false;
  aiMessage = '';

  // Nouveaux paramètres contextuels (Prévention & Goulots)
  workloadStr = '';
  blockedStr = '';

  constructor(
    private teamLeaderService: TeamLeaderService,
    private authService: AuthService,
    private aiService: AiService
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  ngAfterViewInit() {
    // Small delay to ensure DOM is fully rendered before chart init
    setTimeout(() => {
      if (typeof initDashboardCharts === 'function') {
        initDashboardCharts();
      }
    }, 500);
  }


  loadDashboardData() {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.isLoading = true;
    
    // Load Projects
    this.teamLeaderService.getProjectsByUserId(userId).subscribe(projects => {
      this.myProjects = projects;
      this.stats.projects = projects.length;
      
      let allTasks: Task[] = [];
      let projectsProcessed = 0;

      if (projects.length === 0) {
        this.isLoading = false;
        return;
      }

      projects.forEach(p => {
        this.teamLeaderService.getTasksByProjectId(p.id).subscribe(tasks => {
          allTasks = [...allTasks, ...tasks];
          projectsProcessed++;

          if (projectsProcessed === projects.length) {
            this.stats.activeTasks = allTasks.filter(t => t.status !== 'DONE' && t.status !== 'COMPLETED').length;
            this.stats.completedTasks = allTasks.filter(t => t.status === 'DONE' || t.status === 'COMPLETED').length;
            this.recentTasks = allTasks.slice(-5).reverse();
            
            // Unique team members across projects
            const memberIds = new Set();
            projects.forEach(proj => {
              proj.team?.users?.forEach(u => memberIds.add(u.id));
            });
            this.stats.teamMembers = memberIds.size;

            // IA Décisionnelle : Calcul de la surcharge ponctuelle et identification des blocages
            const workloadMap = new Map<string, number>();
            const blockedTasks: string[] = [];
            
            allTasks.forEach(t => {
                if (t.status !== 'DONE' && t.status !== 'COMPLETED') {
                    if (t.isBlocked) {
                        blockedTasks.push(`'${t.title}' (Raison: ${t.blockerReason || 'inconnue'})`);
                    }
                    if (t.users && t.users.length > 0) {
                        t.users.forEach(u => {
                            const name = u.firstName;
                            const current = workloadMap.get(name) || 0;
                            workloadMap.set(name, current + (t.estimatedHours || 0));
                        });
                    }
                }
            });

            let wStr = '';
            workloadMap.forEach((hours, name) => wStr += `${name}: ${hours}h, `);
            this.workloadStr = wStr ? wStr.slice(0, -2) : 'Aucune charge active.';
            this.blockedStr = blockedTasks.length > 0 ? blockedTasks.join(', ') : 'Aucune tâche bloquée.';
            
            this.isLoading = false;
          }
        });
      });
    });
  }

  refreshAiStats() {
    const userId = this.authService.getUserId();
    if (!userId) return;
    
    console.log(`[AI-INSIGHTS] 🚀 Génération analyse - userId: ${userId} - mode: insights`);
    this.isAiLoading = true;
    this.aiMessage = '';
    
    this.aiService.getAIStatisticsStream(userId, '', 'insights').subscribe({
      next: (chunk) => {
        this.isAiLoading = false;
        this.aiMessage += chunk;
      },
      error: (err) => {
        this.isAiLoading = false;
        console.error('AI Error:', err);
        if(!this.aiMessage) this.aiMessage = "Erreur de connexion à l'Agent IA.";
      },
      complete: () => {
        this.isAiLoading = false;
      }
    });
  }
}
