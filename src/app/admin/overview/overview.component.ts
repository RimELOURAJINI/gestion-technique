import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { Project, Team, User, Reclamation } from '../../models/models';
import { RouterLink, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AiService } from '../../services/ai.service';
import { FormsModule } from '@angular/forms';
import { PersonalPointageComponent } from '../../shared/personal-pointage/personal-pointage.component';
import { ProjectSupportModalComponent } from '../../shared/project-support-modal/project-support-modal.component';

declare var initDashboardCharts: any;
declare var ApexCharts: any;

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [CommonModule, PersonalPointageComponent, ProjectSupportModalComponent, RouterModule, FormsModule],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class AdminOverviewComponent implements OnInit, AfterViewInit {
  stats = {
    projects: 0,
    teams: 0,
    managers: 0,
    reclamations: 0
  };
  projectBreakdown = {
    completedText: '0%',
    delayedText: '0%',
    inProgressText: '0%'
  };
  recentProjects: Project[] = [];
  recentReclamations: Reclamation[] = [];
  isLoading = true;
  today: Date = new Date();

  isAiLoading = false;
  aiMessage = '';
  
  // Nouveaux paramètres pour aide à la décision
  riskThreshold: number = 80;
  totalReclamations = 0;
  resolvedReclamations = 0;

  // Added missing properties for the template
  projects: Project[] = [];
  showSupportModal = false;
  selectedProject: any = null;

  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private aiService: AiService
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  ngAfterViewInit() {
    // initDashboardCharts() lance les graphiques statiques,
    // mais nos rendus dynamiques vont les écraser pour invoice_chart et revenue-performance-chart.
    setTimeout(() => {
      if (typeof initDashboardCharts === 'function') {
        initDashboardCharts();
      }
    }, 500);
  }

  loadStats() {
    this.isLoading = true;
    
    // Load Projects
    this.adminService.getAllProjects().subscribe((projects) => {
      this.projects = projects; // Set the projects array
      this.stats.projects = projects.length;
      this.recentProjects = projects.slice(-5).reverse();
      
      let completed = 0, delayed = 0, inProgress = 0;
      if (projects.length > 0) {
          completed = projects.filter(p => p.status === 'COMPLETED').length;
          delayed = projects.filter(p => {
              if (p.status === 'COMPLETED') return false;
              if (p.deadline) return new Date(p.deadline) < this.today;
              if (p.expectedEndDate) return new Date(p.expectedEndDate) < this.today;
              return false;
          }).length;
          inProgress = projects.length - completed - delayed;
          
          this.projectBreakdown.completedText = Math.round((completed / projects.length) * 100) + '%';
          this.projectBreakdown.delayedText = Math.round((delayed / projects.length) * 100) + '%';
          this.projectBreakdown.inProgressText = Math.round((inProgress / projects.length) * 100) + '%';
      }
      
      // Mettre à jour les graphes avec des vraies données
      setTimeout(() => this.renderDynamicCharts(projects, completed, delayed, inProgress), 800);
    });

    // Load Teams
    this.adminService.getAllTeams().subscribe((teams: any) => {
      const teamList = teams.teams || teams;
      this.stats.teams = teamList.length;
    });

    // Load Managers
    this.adminService.getUsersByRole('ROLE_TEAM_LEADER').subscribe((managers) => {
      this.stats.managers = managers.length;
    });

    // Load Reclamations
    this.adminService.getReclamations().subscribe((reclamations) => {
      this.totalReclamations = reclamations.length;
      this.resolvedReclamations = reclamations.filter(r => r.status && r.status !== 'PENDING').length;
      
      this.stats.reclamations = reclamations.filter(r => r.status === 'PENDING').length;
      this.recentReclamations = reclamations.slice(-5).reverse();
      this.isLoading = false;
    });
  }

  renderDynamicCharts(projects: Project[], completed: number, delayed: number, inProgress: number) {
    if (typeof ApexCharts === 'undefined') return;

    // 1. Répartition par État (Pie Chart)
    const pieCtx = document.getElementById("invoice_chart");
    if (pieCtx) {
      pieCtx.innerHTML = '';
      const pieConfig = {
        colors: ['#03C95A', '#E70D0D', '#FFC107'],
        series: [completed, delayed, inProgress],
        chart: {
          fontFamily: 'Poppins, sans-serif',
          height: 200,
          type: 'donut',
        },
        labels: ['Terminés', 'Retard', 'En cours'],
        legend: { show: false },
        dataLabels: { enabled: false },
        plotOptions: {
          pie: {
            donut: {
              labels: {
                show: true,
                name: { show: true, fontSize: '10px' },
                value: { show: true, fontSize: '16px', formatter: function (val: any) { return val; } },
                total: { show: true, showAlways: true, formatter: function (w: any) { return projects.length; }, label: 'Total' }
              }
            }
          }
        }
      };
      new ApexCharts(pieCtx, pieConfig).render();
    }

    // 2. Performance Financière des Projets (Budget Area Chart)
    const revCtx = document.getElementById("revenue-performance-chart");
    if (revCtx) {
      revCtx.innerHTML = '';
      
      // On prend les 10 derniers projets pour que le graphe soit lisible
      const recentProj = projects.slice(-10);
      const categories = recentProj.map(p => p.name.substring(0, 15) + (p.name.length > 15 ? '...' : ''));
      const budgetData = recentProj.map(p => p.budget || 0);
      const spentData = recentProj.map(p => p.spentBudget || 0);

      const areaConfig = {
        chart: { type: 'area', height: 350, toolbar: { show: false } },
        series: [
          { name: "Budget Alloué", data: budgetData },
          { name: "Budget Consommé", data: spentData }
        ],
        stroke: { curve: 'smooth', width: 2 },
        colors: ['#3B44F6', '#FF3B30'],
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 100] } },
        dataLabels: { enabled: false },
        xaxis: { categories: categories, labels: { style: { fontSize: '11px' } } },
        yaxis: { labels: { formatter: function (val: any) { return val + " TND"; } } },
        tooltip: { shared: true, intersect: false, y: { formatter: function (val: any) { return val + " TND"; } } },
        legend: { show: true, position: 'top' }
      };
      new ApexCharts(revCtx, areaConfig).render();
    }
  }

  refreshAiStats() {
    const userId = this.authService.getUserId() || Number(JSON.parse(localStorage.getItem('user') || '{}').id);
    if (!userId) return;

    this.isAiLoading = true;
    this.aiMessage = '';
    
    // On lance la génération au format Stream ("insights")
    this.aiService.getAIStatisticsStream(userId, '', 'insights').subscribe({
      next: (chunk) => {
        this.isAiLoading = false;
        this.aiMessage += chunk;
      },
      error: (err) => {
        console.error('AI Error:', err);
        if (!this.aiMessage) this.aiMessage = 'Erreur lors de l\'analyse de la vélocité via l\'agent IA.';
        this.isAiLoading = false;
      },
      complete: () => {
        this.isAiLoading = false;
      }
    });
  }

  // Added missing method
  openProjectTickets(project: any) {
    this.selectedProject = project;
    this.showSupportModal = true;
  }
}
