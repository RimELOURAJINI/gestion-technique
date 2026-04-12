import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketHubComponent } from '../../shared/ticket-hub/ticket-hub.component';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, TicketHubComponent],
  template: `
    <div class="p-2 p-md-4 mb-4">
        <div class="mb-4">
            <h4 class="fw-bold text-dark mb-1">Tickets / Discussions Clients</h4>
            <p class="text-muted small">Partagez vos mises à jour techniques et répondez aux besoins clients sur vos projets.</p>
        </div>
        <app-ticket-hub mode="employee"></app-ticket-hub>
    </div>
  `,
  styles: []
})
export class TicketsComponent {}
