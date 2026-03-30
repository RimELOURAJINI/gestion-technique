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
      { path: 'users', component: UserManagementComponent },
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
      { path: 'settings', component: EmployeeSettingsComponent },
      { path: 'performance', component: EmployeePerformanceComponent },
      { path: 'tasks/:id', component: TaskDetailComponent },
      { path: 'projects/:id', component: ProjectDetailComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];