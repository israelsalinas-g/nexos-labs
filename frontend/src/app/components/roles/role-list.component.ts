import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RoleService } from '../../services/role.service';
import { AuthService } from '../../services/auth.service';
import { Role, RoleListItem, CreateRoleRequest, RolePaginatedResponse } from '../../models/role.interface';
import { Permission } from '../../models/permission.interface';

/**
 * Componente para CRUD de roles
 * Solo accesible por SUPERADMIN
 */
@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.css']
})
export class RoleListComponent implements OnInit {
  private roleService = inject(RoleService);
  private authService = inject(AuthService);
  private router = inject(Router);

  roles: RoleListItem[] = [];
  currentPage = 1;
  pageSize = 4;
  totalRoles = 0;
  totalPages = 0;
  loading = false;
  error = '';
  successMessage = '';

  // Modal states
  showConfirmModal = false;
  showRoleModal = false;
  showPermissionsModal = false;

  // Form data
  roleFormData: CreateRoleRequest = {
    name: '',
    level: 3,
    description: ''
  };

  // Permissions
  selectedRole: Role | null = null;
  newPermission = {
    code: '',
    description: ''
  };

  // Confirm action
  confirmAction = {
    title: '',
    message: '',
    action: () => {}
  };

  isEditMode = false;
  roleToDelete: RoleListItem | null = null;

  // Default roles that cannot be deleted
  defaultRoles = ['SUPERADMIN', 'ADMIN', 'TECNICO', 'OPERADOR'];

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading = true;
    this.error = '';
    this.successMessage = '';

    this.roleService.getRoles(this.currentPage, this.pageSize).subscribe({
      next: (response: RolePaginatedResponse) => {
        this.roles = response.data;
        this.totalRoles = response.total;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading roles:', err);
        this.error = err.message || 'Error al cargar los roles';
        this.loading = false;
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadRoles();
    }
  }

  createNewRole(): void {
    this.isEditMode = false;
    this.roleFormData = {
      name: '',
      level: 3,
      description: ''
    };
    this.showRoleModal = true;
  }

  viewRole(role: RoleListItem): void {
    // Implementar vista detallada del rol
    console.log('Ver rol:', role);
  }

  editRole(role: RoleListItem): void {
    this.isEditMode = true;
    this.roleFormData = {
      name: role.name,
      level: role.level,
      description: role.description
    };
    this.showRoleModal = true;
  }

  deleteRole(role: RoleListItem): void {
    if (this.isDefaultRole(role.name)) {
      this.error = 'No se pueden eliminar los roles predefinidos del sistema';
      return;
    }

    this.roleToDelete = role;
    this.confirmAction = {
      title: 'Confirmar eliminación',
      message: `¿Está seguro de que desea eliminar el rol "${role.name}"? Esta acción no se puede deshacer.`,
      action: () => {}
    };
    this.showConfirmModal = true;
  }

  confirmDelete(): void {
    if (!this.roleToDelete) return;

    this.loading = true;
    this.roleService.deleteRole(this.roleToDelete.id).subscribe({
      next: () => {
        this.successMessage = `Rol "${this.roleToDelete!.name}" eliminado exitosamente`;
        this.showConfirmModal = false;
        this.roleToDelete = null;
        setTimeout(() => {
          this.loadRoles();
          this.successMessage = '';
        }, 1500);
      },
      error: (err) => {
        this.error = err.message || 'Error al eliminar el rol';
        this.loading = false;
      }
    });
  }

  saveRole(): void {
    if (!this.isFormValid()) return;

    this.loading = true;

    const roleData = {
      name: this.roleFormData.name,
      level: this.roleFormData.level,
      description: this.roleFormData.description
    };

    if (this.isEditMode) {
      // Implementar actualización
      const roleToUpdate = this.roles.find(r => r.name === this.roleFormData.name);
      if (roleToUpdate) {
        this.roleService.updateRole(roleToUpdate.id, roleData).subscribe({
          next: () => {
            this.successMessage = 'Rol actualizado exitosamente';
            this.showRoleModal = false;
            setTimeout(() => {
              this.loadRoles();
              this.successMessage = '';
            }, 1500);
          },
          error: (err) => {
            this.error = err.message || 'Error al actualizar el rol';
            this.loading = false;
          }
        });
      }
    } else {
      this.roleService.createRole(roleData).subscribe({
        next: () => {
          this.successMessage = 'Rol creado exitosamente';
          this.showRoleModal = false;
          setTimeout(() => {
            this.loadRoles();
            this.successMessage = '';
          }, 1500);
        },
        error: (err) => {
          this.error = err.message || 'Error al crear el rol';
          this.loading = false;
        }
      });
    }
  }

  managePermissions(role: RoleListItem): void {
    // Fetch the full role object with permissions
    this.loading = true;
    this.roleService.getRoleById(role.id).subscribe({
      next: (fullRole: Role) => {
        this.selectedRole = fullRole;
        this.newPermission = { code: '', description: '' };
        this.showPermissionsModal = true;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Error al cargar el rol';
        this.loading = false;
      }
    });
  }

  addPermission(): void {
    if (!this.selectedRole || !this.newPermission.code || !this.newPermission.description) {
      return;
    }

    this.loading = true;
    this.roleService.addPermissionToRole(this.selectedRole.id, this.newPermission).subscribe({
      next: (permission: Permission) => {
        if (!this.selectedRole!.permissions) {
          this.selectedRole!.permissions = [];
        }
        this.selectedRole!.permissions.push(permission);
        this.newPermission = { code: '', description: '' };
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Error al agregar permiso';
        this.loading = false;
      }
    });
  }

  removePermission(permissionId: string): void {
    if (!this.selectedRole) return;

    this.loading = true;
    this.roleService.removePermissionFromRole(this.selectedRole.id, permissionId).subscribe({
      next: () => {
        if (this.selectedRole?.permissions) {
          this.selectedRole.permissions = this.selectedRole.permissions.filter(
            (p: Permission) => p.id !== permissionId
          );
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Error al remover permiso';
        this.loading = false;
      }
    });
  }

  closeRoleModal(): void {
    this.showRoleModal = false;
    this.isEditMode = false;
    this.roleFormData = { name: '', level: 3, description: '' };
  }

  closePermissionsModal(): void {
    this.showPermissionsModal = false;
    this.selectedRole = null;
    this.newPermission = { code: '', description: '' };
  }

  closeModal(): void {
    this.showConfirmModal = false;
    this.confirmAction = { title: '', message: '', action: () => {} };
  }

  isFormValid(): boolean {
    return !!(this.roleFormData.name && this.roleFormData.level && this.roleFormData.description);
  }

  isDefaultRole(roleName: string): boolean {
    return this.defaultRoles.includes(roleName);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-HN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
