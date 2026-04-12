import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { AuthGuard } from './guards/auth.guard';

import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { ManagerDashboardComponent } from './manager/manager-dashboard/manager-dashboard.component';
import { TeamManagementComponent } from './admin/team-management/team-management.component';
import { ProjectManagementComponent } from './admin/project-management/project-management.component';
import { TaskManagementComponent } from './admin/task-management/task-management.component';
import { TeamProjectsComponent } from './manager/team-projects/team-projects.component';
import { TeamTasksComponent } from './manager/team-tasks/team-tasks.component';
import { DealsComponent } from './manager/deals/deals.component';
import { TicketsComponent } from './manager/tickets/tickets.component';
import { EmployeeDashboardComponent } from './employee/employee-dashboard/employee-dashboard.component';
import { EmployeeHomeComponent } from './employee/employee-home/employee-home.component';
import { MyTasksComponent } from './employee/my-tasks/my-tasks.component';
import { MyProjectsComponent } from './employee/my-projects/my-projects.component';
import { AdminReclamationsComponent } from './admin/reclamations/reclamations.component';
import { AdminTicketsComponent } from './admin/tickets/tickets.component';
import { AdminOverviewComponent } from './admin/overview/overview.component';
import { UserManagementComponent } from './admin/user-management/user-management.component';
import { ManagerOverviewComponent } from './manager/overview/overview.component';
import { TicketsComponent as EmployeeTicketsComponent } from './employee/tickets/tickets.component';
import { CalendarComponent } from './employee/calendar/calendar.component';
import { TimesheetsComponent } from './employee/timesheets/timesheets.component';
import { EmployeeSettingsComponent } from './employee/settings/settings.component';
import { EmployeePerformanceComponent } from './employee/performance/performance.component';
import { TaskDetailComponent } from './employee/task-detail/task-detail.component';
import { ProjectDetailComponent } from './employee/project-detail/project-detail.component';
import { CommercialDashboardComponent } from './commercial/commercial-dashboard/commercial-dashboard.component';
import { ProjectsComponent as CommercialProjectsComponent } from './commercial/projects/projects.component';
import { ProjectDetailsComponent as CommercialProjectDetailsComponent } from './commercial/project-details/project-details.component';
import { DealsComponent as CommercialDealsComponent } from './commercial/deals/deals.component';
import { TicketsComponent as CommercialTicketsComponent } from './commercial/tickets/tickets.component';
import { ClientDashboardComponent } from './client/client-dashboard/client-dashboard.component';
import { DealsComponent as ClientDealsComponent } from './client/deals/deals.component';
import { FeaturePlaceholderComponent } from './shared/feature-placeholder/feature-placeholder.component';
import { AdminFinanceComponent } from './admin/finance/finance.component';
import { DealsComponent as AdminDealsComponent } from './admin/deals/deals.component';
import { AdminAuditComponent } from './admin/audit/audit.component';
import { ManagerPlanningComponent } from './manager/planning/planning.component';
import { ManagerApprovalsComponent } from './manager/approvals/approvals.component';
import { EmployeeWellnessComponent } from './employee/wellness/wellness.component';
import { ClientProjectsComponent } from './client/projects/projects.component';
import { ClientTicketsComponent } from './client/tickets/tickets.component';

import { SignupComponent } from './signup/signup.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'overview', component: AdminOverviewComponent },
      { path: 'teams', component: TeamManagementComponent },
      { path: 'projects', component: ProjectManagementComponent },
      { path: 'tasks', component: TaskManagementComponent },
      { path: 'reclamations', component: AdminReclamationsComponent },
      { path: 'tickets', component: AdminTicketsComponent },
      { path: 'users', component: UserManagementComponent },
      { path: 'finance', component: AdminFinanceComponent },
      { path: 'audit', component: AdminAuditComponent },
      { path: 'role-permissions', component: FeaturePlaceholderComponent, data: { title: 'Rôles & Permissions', description: 'Configuration des rôles et droits d\'accès.' } },
      { path: 'settings', component: FeaturePlaceholderComponent, data: { title: 'Paramètres Admin', description: 'Paramètres généraux, logs et sauvegardes.' } },
      { path: 'deals', component: AdminDealsComponent },
      { path: '', redirectTo: 'overview', pathMatch: 'full' }
    ]
  },
  {
    path: 'manager',
    component: ManagerDashboardComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'ROLE_TEAM_LEADER' },
    children: [
      { path: 'overview', component: ManagerOverviewComponent },
      { path: 'projects', component: TeamProjectsComponent },
      { path: 'tasks', component: TeamTasksComponent },
      { path: 'deals', component: DealsComponent },
      { path: 'tickets', component: TicketsComponent },
      { path: 'planning', component: ManagerPlanningComponent },
      { path: 'approvals', component: ManagerApprovalsComponent },
      { path: 'performance', component: FeaturePlaceholderComponent, data: { title: 'Performance Équipe', description: 'KPI et suivi de performance des membres.' } },
      { path: 'contacts', component: FeaturePlaceholderComponent, data: { title: 'Contacts', description: 'Annuaire et gestion des contacts.' } },
      { path: 'attendance', component: FeaturePlaceholderComponent, data: { title: 'Présences', description: 'Suivi de présence de l\'équipe.' } },
      { path: 'leaves', component: FeaturePlaceholderComponent, data: { title: 'Congés Équipe', description: 'Demandes de congés en attente et historiques.' } },
      { path: 'team', component: FeaturePlaceholderComponent, data: { title: 'Mon Équipe', description: 'Vue d\'ensemble des membres et rôles de l\'équipe.' } },
      { path: 'settings', component: FeaturePlaceholderComponent, data: { title: 'Paramètres Manager', description: 'Préférences manager et options de pilotage.' } },
      { path: '', redirectTo: 'overview', pathMatch: 'full' }
    ]
  },
  {
    path: 'employee',
    component: EmployeeDashboardComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'ROLE_Employee' },
    children: [
      { path: 'home', component: EmployeeHomeComponent },
      { path: 'tasks', component: MyTasksComponent },
      { path: 'projects', component: MyProjectsComponent },
      { path: 'tickets', component: EmployeeTicketsComponent },
      { path: 'calendar', component: CalendarComponent },
      { path: 'timesheets', component: TimesheetsComponent },
      { path: 'leaves', component: FeaturePlaceholderComponent, data: { title: 'Mes Congés', description: 'Demandes de congés et historique des validations.' } },
      { path: 'settings', component: EmployeeSettingsComponent },
      { path: 'performance', component: EmployeePerformanceComponent },
      { path: 'wellness', component: EmployeeWellnessComponent },
      { path: 'tasks/:id', component: TaskDetailComponent },
      { path: 'projects/:id', component: ProjectDetailComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },
  {
    path: 'commercial',
    component: CommercialDashboardComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'ROLE_COMMERCIAL' },
    children: [
      { path: 'projects', component: CommercialProjectsComponent },
      { path: 'projects/:id', component: CommercialProjectDetailsComponent },
      { path: 'settings', component: FeaturePlaceholderComponent, data: { title: 'Paramètres Commercial', description: 'Préférences commercial et options de suivi.' } },
      { path: 'deals', component: CommercialDealsComponent },
      { path: 'tickets', component: CommercialTicketsComponent },
      { path: '', redirectTo: 'projects', pathMatch: 'full' }
    ]
  },
  {
    path: 'client',
    component: ClientDashboardComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'ROLE_CLIENT' },
    children: [
      { path: 'overview', component: ClientProjectsComponent },
      { path: 'tickets', component: ClientTicketsComponent },
      { path: 'deals', component: ClientDealsComponent },
      { path: 'settings', component: FeaturePlaceholderComponent, data: { title: 'Paramètres Client', description: 'Préférences client et options de compte.' } },
      { path: '', redirectTo: 'overview', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];