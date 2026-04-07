import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-feature-placeholder',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="content container-fluid">
      <div class="page-header mb-4">
        <h3 class="page-title">{{ title }}</h3>
        <p class="text-muted mb-0">{{ description }}</p>
      </div>

      <div class="card border-0 shadow-sm">
        <div class="card-body p-4">
          <h5 class="fw-bold mb-2">Module en cours d'activation</h5>
          <p class="text-muted mb-3">
            Cette section est maintenant routée et accessible depuis la navigation.
          </p>
          <span class="badge bg-soft-info text-info">Route active</span>
        </div>
      </div>
    </div>
  `
})
export class FeaturePlaceholderComponent {
  title = 'Section';
  description = 'Contenu visible pour éviter les pages vides.';

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data) => {
      this.title = data['title'] || this.title;
      this.description = data['description'] || this.description;
    });
  }
}
