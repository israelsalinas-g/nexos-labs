import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoleService } from '../../services/role.service';
import { AuthService } from '../../services/auth.service';
import { Role, RoleListItem, CreateRoleRequest, RolePaginatedResponse } from '../../models/role.interface';
import { Permission } from '../../models/permission.interface';

/**
 * Componente para CRUD de roles.
 * Solo accesible por SUPERADMIN.
 */
@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './role-list.component.html',
  styleUrls: ['./role-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoleListComponent implements OnInit {
  private roleService = inject(RoleService);
  private authService = inject(AuthService);

  roles = signal<RoleListItem[]>([]);
  currentPage = signal<number>(1);
  pageSize = signal<number>(4);
  totalRoles = signal<number>(0);
  totalPages = signal<number>(0);
  loading = signal<boolean>(false);
  error = signal<string>('');
  successMessage = signal<string>('');

  // Modal states
  showConfirmModal = signal<boolean>(false);
  showRoleModal = signal<boolean>(false);
  showPermissionsModal = signal<boolean>(false);

  // Form data
  roleFormData = signal<CreateRoleRequest>({ name: '', level: 3, description: '' });

  // Permissions
  selectedRole = signal<Role | null>(null);
  newPermission = signal<{ code: string; description: string }>({ code: '', description: '' });

  // Confirm action
  confirmAction = signal<{ title: string; message: string; action: () => void }>({
    title: '', message: '', action: () => { }
  });

  isEditMode = signal<boolean>(false);
  roleToDelete = signal<RoleListItem | null>(null);

  // Default roles that cannot be deleted
  readonly defaultRoles = ['SUPERADMIN', 'ADMIN', 'TECNICO', 'OPERADOR'];

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading.set(true);
    this.error.set('');
    this.successMessage.set('');

    this.roleService.getRoles(this.currentPage(), this.pageSize()).subscribe({
      next: (response: RolePaginatedResponse) => {
        this.roles.set(response.data);
        this.totalRoles.set(response.total);
        this.totalPages.set(response.totalPages);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Error al cargar los roles');
        this.loading.set(false);
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadRoles();
    }
  }

  createNewRole(): void {
    this.isEditMode.set(false);
    this.roleFormData.set({ name: '', level: 3, description: '' });
    this.showRoleModal.set(true);
  }

  editRole(role: RoleListItem): void {
    this.isEditMode.set(true);
    this.roleFormData.set({ name: role.name, level: role.level, description: role.description });
    this.showRoleModal.set(true);
  }

  deleteRole(role: RoleListItem): void {
    if (this.isDefaultRole(role.name)) {
      this.error.set('No se pueden eliminar los roles predefinidos del sistema');
      return;
    }
    this.roleToDelete.set(role);
    this.confirmAction.set({
      title: 'Confirmar eliminación',
      message: `¿Está seguro de que desea eliminar el rol "${role.name}"? Esta acción no se puede deshacer.`,
      action: () => this.confirmDelete()
    });
    this.showConfirmModal.set(true);
  }

  confirmDelete(): void {
    const target = this.roleToDelete();
    if (!target) return;
    this.loading.set(true);
    this.roleService.deleteRole(target.id).subscribe({
      next: () => {
        this.successMessage.set(`Rol "${target.name}" eliminado exitosamente`);
        this.showConfirmModal.set(false);
        this.roleToDelete.set(null);
        setTimeout(() => { this.loadRoles(); this.successMessage.set(''); }, 1500);
      },
      error: (err) => { this.error.set(err.message || 'Error al eliminar el rol'); this.loading.set(false); }
    });
  }

  saveRole(): void {
    if (!this.isFormValid()) return;
    this.loading.set(true);
    const roleData = this.roleFormData();

    if (this.isEditMode()) {
      const roleToUpdate = this.roles().find(r => r.name === roleData.name);
      if (roleToUpdate) {
        this.roleService.updateRole(roleToUpdate.id, roleData).subscribe({
          next: () => {
            this.successMessage.set('Rol actualizado exitosamente');
            this.showRoleModal.set(false);
            setTimeout(() => { this.loadRoles(); this.successMessage.set(''); }, 1500);
          },
          error: (err) => { this.error.set(err.message || 'Error al actualizar el rol'); this.loading.set(false); }
        });
      }
    } else {
      this.roleService.createRole(roleData).subscribe({
        next: () => {
          this.successMessage.set('Rol creado exitosamente');
          this.showRoleModal.set(false);
          setTimeout(() => { this.loadRoles(); this.successMessage.set(''); }, 1500);
        },
        error: (err) => { this.error.set(err.message || 'Error al crear el rol'); this.loading.set(false); }
      });
    }
  }

  managePermissions(role: RoleListItem): void {
    this.loading.set(true);
    this.roleService.getRoleById(role.id).subscribe({
      next: (fullRole: Role) => {
        this.selectedRole.set(fullRole);
        this.newPermission.set({ code: '', description: '' });
        this.showPermissionsModal.set(true);
        this.loading.set(false);
      },
      error: (err) => { this.error.set(err.message || 'Error al cargar el rol'); this.loading.set(false); }
    });
  }

  addPermission(): void {
    const role = this.selectedRole();
    const perm = this.newPermission();
    if (!role || !perm.code || !perm.description) return;

    this.loading.set(true);
    this.roleService.addPermissionToRole(role.id, perm).subscribe({
      next: (permission: Permission) => {
        const current = this.selectedRole()!;
        this.selectedRole.set({
          ...current,
          permissions: [...(current.permissions || []), permission]
        });
        this.newPermission.set({ code: '', description: '' });
        this.loading.set(false);
      },
      error: (err) => { this.error.set(err.message || 'Error al agregar permiso'); this.loading.set(false); }
    });
  }

  removePermission(permissionId: string): void {
    const role = this.selectedRole();
    if (!role) return;
    this.loading.set(true);
    this.roleService.removePermissionFromRole(role.id, permissionId).subscribe({
      next: () => {
        const current = this.selectedRole()!;
        this.selectedRole.set({
          ...current,
          permissions: (current.permissions || []).filter((p: Permission) => p.id !== permissionId)
        });
        this.loading.set(false);
      },
      error: (err) => { this.error.set(err.message || 'Error al remover permiso'); this.loading.set(false); }
    });
  }

  closeRoleModal(): void {
    this.showRoleModal.set(false);
    this.isEditMode.set(false);
    this.roleFormData.set({ name: '', level: 3, description: '' });
  }

  closePermissionsModal(): void {
    this.showPermissionsModal.set(false);
    this.selectedRole.set(null);
    this.newPermission.set({ code: '', description: '' });
  }

  closeModal(): void {
    this.showConfirmModal.set(false);
    this.confirmAction.set({ title: '', message: '', action: () => { } });
  }

  isFormValid(): boolean {
    const form = this.roleFormData();
    return !!(form.name && form.level && form.description);
  }

  isDefaultRole(roleName: string): boolean {
    return this.defaultRoles.includes(roleName);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-HN', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }
}
