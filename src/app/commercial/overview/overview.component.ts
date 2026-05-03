import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PersonalPointageComponent } from '../../shared/personal-pointage/personal-pointage.component';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { AiService } from '../../services/ai.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-commercial-overview',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PersonalPointageComponent],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class CommercialOverviewComponent implements OnInit {
  commercialName: string = '';
  stats = {
    deals: 0,
    activeProjects: 0,
    wonDeals: 0,
    pipeline: 0
  };
  
  aiMessage: string = '';
  aiMessageHtml: SafeHtml = '';
  isAiLoading: boolean = false;
  today = new Date();

  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    private aiService: AiService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUserValue;
    if (user) {
      this.commercialName = user.firstName || 'Commercial';
      this.loadStats();
    }
  }

  loadStats() {
    this.adminService.getAllProjects().subscribe(projects => {
      this.stats.activeProjects = projects.filter(p => p.status === 'ACTIVE' || p.status === 'IN_PROGRESS').length;
    });
    
    this.stats.deals = 5; 
    this.stats.pipeline = 125000; 
  }

  refreshAiStats() {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.isAiLoading = true;
    this.aiMessage = '';
    
    this.aiService.getAIStatisticsStream(userId, '', 'insights').subscribe({
      next: (chunk: string) => {
        this.isAiLoading = false;
        this.aiMessage += chunk;
        this.aiMessageHtml = this.sanitizer.bypassSecurityTrustHtml(this.formatAiResponse(this.aiMessage));
      },
      error: (err: any) => {
        console.error('Erreur IA:', err);
        if (!this.aiMessage) {
           this.aiMessage = "Désolé, l'agent IA rencontre des difficultés pour analyser vos données actuellement.";
           this.aiMessageHtml = this.sanitizer.bypassSecurityTrustHtml(this.aiMessage);
        }
        this.isAiLoading = false;
      },
      complete: () => {
        this.isAiLoading = false;
      }
    });
  }

  private formatAiResponse(text: string): string {
    if (!text) return '';
    return text.replace(/\n/g, '<br>');
  }
}
