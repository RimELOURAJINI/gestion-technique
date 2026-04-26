import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { UnifiedProjectDetailComponent } from './shared/unified-project-detail/unified-project-detail.component';
import { ManagerLeavesComponent } from './manager/leaves/leaves.component';
import { TeamChatComponent } from './manager/team-chat/team-chat.component';

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
import { ReclamationHubComponent } from './shared/reclamations/reclamations.component';
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
import { EmployeeLeavesComponent } from './employee/leaves/leaves.component';
import { AdminAttendanceComponent } from './admin/attendance/attendance.component';
import { ClientProjectsComponent } from './client/projects/projects.component';
import { ClientTicketsComponent } from './client/tickets/tickets.component';
import { ManagerAttendanceComponent } from './manager/attendance/attendance.component';
import { ManagerPerformanceComponent } from './manager/performance/performance.component';
import { ManagerContactsComponent } from './manager/contacts/contacts.component';
import { AttendancePersonalComponent } from './shared/attendance-personal/attendance-personal.component';
import { EmployeeTeamChatComponent } from './employee/team-chat/employee-team-chat.component';
import { AdminDailyReportsComponent } from './admin/daily-reports/daily-reports.component';
import { ManagerDailyReportComponent } from './manager/daily-report/daily-report.component';
import { EmployeeDailyReportComponent } from './employee/daily-report/daily-report.component';
import { CommercialDailyReportComponent } from './commercial/daily-report/daily-report.component';
import { AdminPrimesComponent } from './admin/primes/primes.component';
import { MyPrimesComponent } from './shared/my-primes/my-primes.component';

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
      { path: 'teams/:id', loadComponent: () => import('./admin/team-detail/team-detail.component').then(m => m.TeamDetailComponent) },
      { path: 'projects', component: ProjectManagementComponent },
      { path: 'projects/:id', component: UnifiedProjectDetailComponent },
      { path: 'tasks', component: TaskManagementComponent },
      { path: 'reclamations', component: ReclamationHubComponent },
      { path: 'tickets', component: AdminTicketsComponent },
      { path: 'users', component: UserManagementComponent },
      { path: 'finance', component: AdminFinanceComponent },
      { path: 'audit', component: AdminAuditComponent },
      { path: 'daily-reports', component: AdminDailyReportsComponent },
      { path: 'role-permissions', component: FeaturePlaceholderComponent, data: { title: 'Rôles & Permissions', description: 'Configuration des rôles et droits d\'accès.' } },
      { path: 'settings', component: FeaturePlaceholderComponent, data: { title: 'Paramètres Admin', description: 'Paramètres généraux, logs et sauvegardes.' } },
      { path: 'deals', component: AdminDealsComponent },
      { path: 'attendance', component: AdminAttendanceComponent },
      { path: 'my-attendance', component: AttendancePersonalComponent },
      { path: 'my-leaves', component: EmployeeLeavesComponent },
      { path: 'primes', component: AdminPrimesComponent },
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
      { path: 'projects/:id', component: UnifiedProjectDetailComponent },
      { path: 'tasks', component: TeamTasksComponent },
      { path: 'deals', component: DealsComponent },
      { path: 'tickets', component: TicketsComponent },
      { path: 'reclamations', component: ReclamationHubComponent },
      { path: 'planning', component: ManagerPlanningComponent },
      { path: 'approvals', component: ManagerApprovalsComponent },
      { path: 'performance', component: ManagerPerformanceComponent },
      { path: 'contacts', component: ManagerContactsComponent },
      { path: 'attendance', component: ManagerAttendanceComponent },
      { path: 'leaves', component: ManagerLeavesComponent },
      { path: 'my-attendance', component: AttendancePersonalComponent },
      { path: 'my-leaves', component: EmployeeLeavesComponent },
      { path: 'primes', component: MyPrimesComponent },
      { path: 'team-chat', component: TeamChatComponent },
      { path: 'daily-report', component: ManagerDailyReportComponent },
      { path: 'team', loadComponent: () => import('./manager/my-team/my-team.component').then(m => m.MyTeamComponent) },
      { path: 'settings', component: FeaturePlaceholderComponent, data: { title: 'Paramètres Manager', description: 'Préférences manager et options de pilotage.' } },
      { path: '', redirectTo: 'overview', pathMatch: 'full' }
    ]
  },
  {
    path: 'commercial-leader',
    component: ManagerDashboardComponent,
    canActivate: [AuthGuard],
    data: { expectedRole: 'ROLE_COMMERCIAL_LEADER' },
    children: [
      { path: 'overview', component: ManagerOverviewComponent },
      { path: 'projects', component: TeamProjectsComponent },
      { path: 'projects/:id', component: UnifiedProjectDetailComponent },
      { path: 'tasks', component: TeamTasksComponent },
      { path: 'deals', component: DealsComponent },
      { path: 'tickets', component: TicketsComponent },
      { path: 'reclamations', component: ReclamationHubComponent },
      { path: 'planning', component: ManagerPlanningComponent },
      { path: 'approvals', component: ManagerApprovalsComponent },
      { path: 'performance', component: ManagerPerformanceComponent },
      { path: 'contacts', component: ManagerContactsComponent },
      { path: 'attendance', component: ManagerAttendanceComponent },
      { path: 'leaves', component: ManagerLeavesComponent },
      { path: 'my-attendance', component: AttendancePersonalComponent },
      { path: 'my-leaves', component: EmployeeLeavesComponent },
      { path: 'primes', component: MyPrimesComponent },
      { path: 'team-chat', component: TeamChatComponent },
      { path: 'daily-report', component: ManagerDailyReportComponent },
      { path: 'team', loadComponent: () => import('./manager/my-team/my-team.component').then(m => m.MyTeamComponent) },
      { path: 'settings', component: FeaturePlaceholderComponent, data: { title: 'Paramètres Leader Commercial', description: 'Préférences leader commercial et options de pilotage.' } },
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
      { path: 'reclamations', component: ReclamationHubComponent },
      { path: 'calendar', component: CalendarComponent },
      { path: 'timesheets', component: TimesheetsComponent },
      { path: 'leaves', component: EmployeeLeavesComponent },
      { path: 'primes', component: MyPrimesComponent },
      { path: 'settings', component: EmployeeSettingsComponent },
      { path: 'performance', component: EmployeePerformanceComponent },
      { path: 'wellness', component: EmployeeWellnessComponent },
      { path: 'tasks/:id', component: TaskDetailComponent },
      { path: 'projects/:id', component: UnifiedProjectDetailComponent },
      { path: 'team-chat', component: EmployeeTeamChatComponent },
      { path: 'daily-report', component: EmployeeDailyReportComponent },
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
      { path: 'projects/:id', component: UnifiedProjectDetailComponent },
      { path: 'settings', component: FeaturePlaceholderComponent, data: { title: 'Paramètres Commercial', description: 'Préférences commercial et options de suivi.' } },
      { path: 'deals', component: CommercialDealsComponent },
      { path: 'tickets', component: CommercialTicketsComponent },
      { path: 'reclamations', component: ReclamationHubComponent },
      { path: 'my-attendance', component: AttendancePersonalComponent },
      { path: 'my-leaves', component: EmployeeLeavesComponent },
      { path: 'primes', component: MyPrimesComponent },
      { path: 'team-chat', component: EmployeeTeamChatComponent },
      { path: 'daily-report', component: CommercialDailyReportComponent },
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
      { path: 'projects/:id', component: UnifiedProjectDetailComponent },
      { path: 'tickets', component: ClientTicketsComponent },
      { path: 'reclamations', component: ReclamationHubComponent },
      { path: 'deals', component: ClientDealsComponent },
      { path: 'my-attendance', component: AttendancePersonalComponent },
      { path: 'my-leaves', component: EmployeeLeavesComponent },
      { path: 'settings', component: FeaturePlaceholderComponent, data: { title: 'Paramètres Client', description: 'Préférences client et options de compte.' } },
      { path: '', redirectTo: 'overview', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];