import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-deals',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './deals.component.html',
    styleUrl: './deals.component.css'
})
export class DealsComponent {
    deals = [
        { name: 'Refonte Site Web', leadName: 'Acme Corp', contact: 'alice@acme.com', value: 12000, stage: 'En cours', nextFollowUp: '2024-05-20' },
        { name: 'App Mobile v2', leadName: 'Global Tech', contact: 'bob@global.com', value: 45000, stage: 'Négociation', nextFollowUp: '2024-06-15' },
        { name: 'Audit Sécurité', leadName: 'Stellar Fin', contact: 'info@stellar.com', value: 25000, stage: 'Terminé', nextFollowUp: '2024-04-10' }
    ];
}
