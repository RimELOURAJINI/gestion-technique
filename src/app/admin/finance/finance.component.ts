import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService } from '../../services/stats.service';

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './finance.component.html',
  styleUrl: './finance.component.css'
})
export class AdminFinanceComponent implements OnInit {
  stats: any = {};

  constructor(private statsService: StatsService) {}

  ngOnInit(): void {
    this.statsService.getFinanceStats().subscribe(data => {
      this.stats = data;
    });
  }
}
