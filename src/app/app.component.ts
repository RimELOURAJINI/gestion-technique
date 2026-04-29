import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalSearchComponent } from './shared/global-search/global-search.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GlobalSearchComponent],
  template: `
    <router-outlet></router-outlet>
    <app-global-search></app-global-search>
  `,
  styles: []
})
export class AppComponent {}