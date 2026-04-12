import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketHubComponent } from '../../shared/ticket-hub/ticket-hub.component';

@Component({
  selector: 'app-admin-tickets',
  standalone: true,
  imports: [CommonModule, TicketHubComponent],
  template: `
    <div class="p-2 p-md-4">
        <div class="mb-4">
            <h4 class="fw-bold text-dark mb-1">Tickets / Discussions Clients</h4>
            <p class="text-muted small">Vue d'ensemble de tous les échanges de support et discussions projets.</p>
        </div>
        <app-ticket-hub mode="admin"></app-ticket-hub>
    </div>
  `,
  styles: []
})
export class AdminTicketsComponent {}
