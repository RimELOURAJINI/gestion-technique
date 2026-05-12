import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService } from '../../services/stats.service';
import { RouterModule } from '@angular/router';

declare var ApexCharts: any;

@Component({
  selector: 'app-admin-performance',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './performance.component.html',
  styleUrl: './performance.component.css'
})
export class AdminPerformanceComponent implements OnInit, AfterViewInit {
  performanceData: any = {
    individuals: [],
    teams: []
  };
  isLoading = true;

  constructor(private statsService: StatsService) {}

  ngOnInit(): void {
    this.loadPerformanceData();
  }

  ngAfterViewInit(): void {
    // Charts will be rendered after data load
  }

  loadPerformanceData() {
    this.isLoading = true;
    this.statsService.getAdminPerformance().subscribe({
      next: (data) => {
        this.performanceData = data;
        this.isLoading = false;
        setTimeout(() => this.renderCharts(), 500);
      },
      error: (err) => {
        console.error('Error loading performance data', err);
        this.isLoading = false;
      }
    });
  }

  renderCharts() {
    if (typeof ApexCharts === 'undefined' || !this.performanceData.teams.length) return;

    // Team Comparison Chart
    const teamOptions = {
      series: [{
        name: 'Score de Performance',
        data: this.performanceData.teams.map((t: any) => t.score)
      }],
      chart: {
        type: 'bar',
        height: 350,
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          borderRadius: 10,
          columnWidth: '50%',
          distributed: true,
        }
      },
      colors: ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a'],
      dataLabels: { enabled: false },
      legend: { show: false },
      xaxis: {
        categories: this.performanceData.teams.map((t: any) => t.name),
        labels: { style: { fontSize: '12px' } }
      },
      yaxis: {
        max: 100,
        labels: { formatter: (val: number) => val + '%' }
      },
      tooltip: {
        y: { formatter: (val: number) => val + '%' }
      }
    };

    const teamChart = new ApexCharts(document.querySelector("#team-chart"), teamOptions);
    teamChart.render();

    // Top 5 Individuals Radar Chart
    const top5 = this.performanceData.individuals.slice(0, 5);
    const radarOptions = {
      series: top5.map((ind: any) => ({
        name: ind.name,
        data: [ind.presence, ind.tasks, ind.victories, ind.problems]
      })),
      chart: {
        height: 350,
        type: 'radar',
        toolbar: { show: false },
        dropShadow: { enabled: true, blur: 1, left: 1, top: 1 }
      },
      stroke: { width: 2 },
      fill: { opacity: 0.1 },
      markers: { size: 0 },
      xaxis: {
        categories: ['Présence', 'Tâches', 'Victoires', 'Qualité']
      },
      yaxis: { show: false, max: 35 },
      legend: { position: 'bottom' }
    };

    const individualChart = new ApexCharts(document.querySelector("#individual-chart"), radarOptions);
    individualChart.render();
  }

  getScoreClass(score: number): string {
    if (score >= 80) return 'bg-soft-success text-success';
    if (score >= 50) return 'bg-soft-primary text-primary';
    return 'bg-soft-warning text-warning';
  }
}
