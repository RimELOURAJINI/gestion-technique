import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-manager-dashboard',
    standalone: true,
    imports: [RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './manager-dashboard.component.html',
    styleUrl: './manager-dashboard.component.css'
})
export class ManagerDashboardComponent {
    constructor(private authService: AuthService) { }

    logout() {
        this.authService.logout();
    }
}
