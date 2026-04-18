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
  
  // For User Form Modal
  userForm = {
    id: 0,
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    roleIds: [] as number[]
  };
  isEditMode = false;

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

  resetForm() {
    this.userForm = {
      id: 0,
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      roleIds: []
    };
    this.isEditMode = false;
  }

  openAddModal() {
    this.resetForm();
    this.isEditMode = false;
  }

  openEditModal(user: User) {
    this.isEditMode = true;
    this.userForm = {
      id: user.id as unknown as number,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '', // Don't show password
      roleIds: (user.roles || []).map(r => r.id as unknown as number)
    };
  }

  toggleFormRole(roleId: number) {
    const index = this.userForm.roleIds.indexOf(roleId);
    if (index > -1) {
      this.userForm.roleIds.splice(index, 1);
    } else {
      this.userForm.roleIds.push(roleId);
    }
  }

  isFormRoleSelected(roleId: number): boolean {
    return this.userForm.roleIds.includes(roleId);
  }

  saveUser() {
    if (!this.userForm.firstName || !this.userForm.lastName || !this.userForm.email) {
      alert('Veuillez remplir les champs obligatoires.');
      return;
    }

    const rolesToSubmit = this.userForm.roleIds.map(id => ({ id }));
    const payload = { ...this.userForm, roles: rolesToSubmit };

    if (this.isEditMode) {
      this.adminService.updateUser(this.userForm.id, payload).subscribe({
        next: () => {
          // If roles changed, update those separately to be sure
          this.adminService.updateUserRoles(this.userForm.id, this.userForm.roleIds).subscribe({
              next: () => {
                  alert('Utilisateur mis à jour avec succès');
                  this.loadUsers();
                  this.closeModals();
              }
          });
        },
        error: (err) => alert('Erreur lors de la mise à jour : ' + (err.error?.message || err.message))
      });
    } else {
      if (!this.userForm.password) {
        alert('Le mot de passe est obligatoire pour la création.');
        return;
      }
      this.adminService.createUser(payload).subscribe({
        next: () => {
          alert('Utilisateur créé avec succès');
          this.loadUsers();
          this.closeModals();
        },
        error: (err) => alert('Erreur lors de la création : ' + (err.error?.message || err.message))
      });
    }
  }

  deleteUser(userId: any) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      this.adminService.deleteUser(userId as unknown as number).subscribe({
        next: () => {
          alert('Utilisateur supprimé avec succès');
          this.loadUsers();
        },
        error: (err) => alert('Erreur lors de la suppression')
      });
    }
  }

  openRoleModal(user: User): void {
    this.selectedUser = user;
    this.selectedRoleIds = (user.roles || []).map(r => r.id as unknown as number);
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

  private closeModals() {
    // Bootstrap close modal logic usually handled by data-bs-dismiss
    // No specific JS needed if using purely data attributes in many cases
  }
}
