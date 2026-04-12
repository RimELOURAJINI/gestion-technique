import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';
import { TicketHubComponent } from '../../shared/ticket-hub/ticket-hub.component';

@Component({
  selector: 'app-client-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule, TicketHubComponent],
  template: `
    <div class="p-2 p-md-4 mb-4">
        <div class="mb-4 d-flex justify-content-between align-items-center">
            <div>
                <h4 class="fw-bold mb-1 text-dark">Centre de Support Client</h4>
                <p class="text-muted small">Gérez vos demandes de support et communiquez avec nos équipes.</p>
            </div>
            <button class="btn btn-primary rounded-pill px-4 shadow-sm" (click)="showCreateModal = true">
                <i class="ti ti-plus me-1"></i> Nouveau Ticket
            </button>
        </div>
        <app-ticket-hub mode="client"></app-ticket-hub>

      <!-- Create Ticket Modal -->
      <div class="modal-backdrop fade show" *ngIf="showCreateModal"></div>
      <div class="modal fade show d-block" *ngIf="showCreateModal">
         <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0 shadow-lg rounded-4">
               <div class="modal-header border-0 p-4 pb-0">
                  <h5 class="fw-bold">Nouveau Ticket de Support</h5>
                  <button type="button" class="btn-close" (click)="showCreateModal = false"></button>
               </div>
               <div class="modal-body p-4">
                  <div class="row mb-3">
                     <div class="col-md-6">
                        <label class="form-label text-muted fs-12 fw-bold">PROJET CONCERNÉ</label>
                        <select class="form-select border-0 bg-light shadow-none" [(ngModel)]="newTicket.projectId">
                           <option [value]="null">Sélectionnez un projet...</option>
                           <option *ngFor="let p of availableProjects" [value]="p.id">{{ p.name }}</option>
                        </select>
                     </div>
                     <div class="col-md-6">
                        <label class="form-label text-muted fs-12 fw-bold">IMPORTANCE</label>
                        <select class="form-select border-0 bg-light shadow-none" [(ngModel)]="newTicket.priority">
                           <option value="LOW">Faible</option>
                           <option value="MEDIUM">Moyenne</option>
                           <option value="HIGH">Élevée</option>
                           <option value="URGENT">Urgente</option>
                        </select>
                     </div>
                  </div>
                  <div class="mb-3">
                     <label class="form-label text-muted fs-12 fw-bold">SUJET</label>
                     <input type="text" class="form-control border-0 bg-light shadow-none" [(ngModel)]="newTicket.subject" placeholder="Ex: Problème d'accès à l'API">
                  </div>
                  <div class="mb-4">
                     <label class="form-label text-muted fs-12 fw-bold">DESCRIPTION</label>
                     <textarea class="form-control border-0 bg-light shadow-none" rows="4" [(ngModel)]="newTicket.description" placeholder="Décrivez votre besoin en détail..."></textarea>
                  </div>
                  <button class="btn btn-primary w-100 rounded-pill py-2 shadow-sm" [disabled]="!newTicket.subject" (click)="createTicket()">Envoyer le Ticket</button>
               </div>
            </div>
         </div>
      </div>
    </div>
  `,
  styles: []
})
export class ClientTicketsComponent implements OnInit {
  availableProjects: any[] = [];
  showCreateModal: boolean = false;
  newTicket: any = { subject: '', description: '', projectId: null, priority: 'MEDIUM' };

  constructor(
    private ticketService: TicketService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const userId = this.authService.getUserId();
    if (userId) {
      this.ticketService.getClientProjects(userId).subscribe(data => this.availableProjects = data);
    }
  }

  createTicket() {
    const userId = this.authService.getUserId();
    if (!userId) return;

    const ticketToCreate = {
      ...this.newTicket,
      type: 'SUPPORT',
      project: this.newTicket.projectId ? { id: this.newTicket.projectId } : null
    };

    delete (ticketToCreate as any).projectId;

    this.ticketService.createTicket(userId, ticketToCreate).subscribe(() => {
      this.showCreateModal = false;
      this.newTicket = { subject: '', description: '', projectId: null };
      // The TicketHub inside the template will reload if it had some refresh mechanism or if we used a Subject,
      // but here a simple reload of the page or the component would suffice.
      // For now, let's assume the user will see it next time or we can add a refresh trigger.
      window.location.reload(); // Simple way to refresh the hub
    });
  }
}
