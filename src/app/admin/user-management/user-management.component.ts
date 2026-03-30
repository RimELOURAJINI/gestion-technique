import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { User, Role } from '../../models/models';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  roles: Role[] = [];
  filteredRoles: Role[] = [];
  selectedUser: User | null = null;
  selectedRoleIds: number[] = [];

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  loadUsers(): void {
    console.log('🔄 Loading users...');
    this.adminService.getAllUsers().subscribe({
      next: (res: any) => {
        console.log('👥 Users API Raw Response:', res);
        const allUsers = Array.isArray(res) ? res : (res.users || []);
        // Filter out admins from the list as requested
        this.users = allUsers.filter((u: User) => 
          !u.roles || !u.roles.some(r => r.name === 'ROLE_ADMIN')
        );
        console.log('✅ Users loaded and filtered:', this.users.length);
      },
      error: (err) => console.error('❌ Error loading users', err)
    });
  }

  loadRoles(): void {
    console.log('🔄 Loading roles...');
    this.adminService.getAllRoles().subscribe({
      next: (res: any) => {
        console.log('🔑 Roles API Raw Response:', res);
        const rolesList = Array.isArray(res) ? res : (res.roles || []);
        this.roles = rolesList;
        // Filter out ROLE_ADMIN for assignment
        this.filteredRoles = this.roles.filter(role => role && role.name !== 'ROLE_ADMIN');
        console.log('✅ Roles loaded and filtered:', this.filteredRoles.length);
      },
      error: (err) => console.error('❌ Error loading roles', err)
    });
  }

  openRoleModal(user: User): void {
    this.selectedUser = user;
    this.selectedRoleIds = (user.roles || []).map(r => r.id as unknown as number);
    // Open modal via Bootstrap JS if needed, but we'll use data-bs-toggle in HTML
  }

  isSelected(roleId: number): boolean {
    return this.selectedRoleIds.includes(roleId);
  }

  toggleRole(roleId: number): void {
    const index = this.selectedRoleIds.indexOf(roleId);
    if (index > -1) {
      this.selectedRoleIds.splice(index, 1);
    } else {
      this.selectedRoleIds.push(roleId);
    }
  }

  updateRoles(): void {
    if (!this.selectedUser) return;
    
    this.adminService.updateUserRoles(this.selectedUser.id as unknown as number, this.selectedRoleIds).subscribe({
      next: (res) => {
        alert('Rôles mis à jour avec succès');
        this.loadUsers();
        this.selectedUser = null;
      },
      error: (err) => alert('Erreur lors de la mise à jour des rôles')
    });
  }

  getRolesNames(user: User): string {
    return (user.roles || []).map(r => r.name.replace('ROLE_', '')).join(', ');
  }
}
