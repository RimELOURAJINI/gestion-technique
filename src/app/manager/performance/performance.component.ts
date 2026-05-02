import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService } from '../../services/stats.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-manager-performance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './performance.component.html',
  styleUrl: './performance.component.css'
})
export class ManagerPerformanceComponent implements OnInit {
  performanceData: any[] = [];
  isLoading = true;
  chart: any;

  private colors = [
    '#4361ee', '#2ec4b6', '#e71d36', '#ff9f1c', '#7209b7', 
    '#3a0ca3', '#4cc9f0', '#f72585', '#b5179e', '#4895ef'
  ];

  constructor(
    private statsService: StatsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.loadPerformanceData(userId);
    }
  }

  loadPerformanceData(managerId: number): void {
    this.isLoading = true;
    this.statsService.getTeamPerformance(managerId).subscribe({
      next: (data) => {
        this.performanceData = data;
        this.isLoading = false;
        setTimeout(() => this.renderPerformanceChart(), 500);
      },
      error: (err) => {
        console.error('Error loading performance data', err);
        this.isLoading = false;
      }
    });
  }

  renderPerformanceChart(): void {
    const chartId = "performance-chart";
    const ctx = document.getElementById(chartId);
    if (!ctx || typeof (window as any).ApexCharts === 'undefined') return;

    ctx.innerHTML = '';

    const series = this.performanceData.map((member, index) => ({
      name: member.name,
      data: member.data
    }));

    // Generate last 7 days labels
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const today = new Date().getDay(); // 0 is Sunday
    const categories = [];
    for (let i = 6; i >= 0; i--) {
      categories.push(days[(today - i + 7) % 7]);
    }

    const options = {
      series: series,
      chart: {
        type: 'area',
        height: 400,
        toolbar: { show: false },
        fontFamily: 'Poppins, sans-serif'
      },
      colors: this.colors,
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 2.5 },
      xaxis: {
        categories: categories,
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        min: 0,
        max: 100,
        labels: { formatter: (val: number) => val + '%' }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.3,
          opacityTo: 0.05,
          stops: [0, 100]
        }
      },
      tooltip: {
        shared: true,
        intersect: false,
        theme: 'light',
        y: { formatter: (val: number) => val + ' % de performance' }
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right'
      }
    };

    if (this.chart) this.chart.destroy();
    this.chart = new (window as any).ApexCharts(ctx, options);
    this.chart.render();
  }

  getProgressBarClass(percent: number): string {
    if (percent > 90) return 'progress-bar bg-danger';
    if (percent > 70) return 'progress-bar bg-warning';
    return 'progress-bar bg-success';
  }

  getProgressColor(percent: number): string {
    if (percent > 80) return 'progress-bar bg-success';
    if (percent > 40) return 'progress-bar bg-primary';
    return 'progress-bar bg-warning';
  }
}
