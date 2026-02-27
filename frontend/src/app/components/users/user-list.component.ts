import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { RoleService } from '../../services/role.service';
import { UserListItem, CreateUserRequest, UpdateUserRequest } from '../../models/user.interface';
import { Role } from '../../models/role.interface';
import { UserAuth } from '../../models/auth.interface';
import { UserRole } from '../../enums/role.enums';

/**
 * Componente de lista de usuarios.
 * Muestra todos los usuarios del sistema con paginación, crear, editar y eliminar.
 * Requiere roles: ADMIN, SUPERADMIN
 */
@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private roleService = inject(RoleService);

  users = signal<UserListItem[]>([]);
  roles = signal<Role[]>([]);
  currentPage = signal<number>(1);
  pageSize = signal<number>(4);
  total = signal<number>(0);
  totalPages = signal<number>(0);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  // Permisos del usuario actual
  canCreateUser = signal<boolean>(false);
  canEditUser = signal<boolean>(false);
  canDeleteUser = signal<boolean>(false);
  currentUser = signal<UserAuth | null>(null);

  // Modal states
  showUserModal = signal<boolean>(false);
  showConfirmModal = signal<boolean>(false);
  showDetailModal = signal<boolean>(false);

  // Form data
  userFormData = signal<CreateUserRequest>({
    username: '', password: '', name: '', lastName: '', email: '', roleId: '', isActive: true
  });

  selectedUser = signal<UserListItem | null>(null);
  userToDelete = signal<UserListItem | null>(null);

  confirmAction = signal<{ title: string; message: string }>({ title: '', message: '' });

  isEditMode = signal<boolean>(false);

  ngOnInit(): void {
    this.checkPermissions();
    this.loadRoles();
    this.loadUsers();
  }

  checkPermissions(): void {
    this.canCreateUser.set(this.authService.hasAnyRole([UserRole.ADMIN, UserRole.SUPERADMIN]));
    this.canEditUser.set(this.authService.hasAnyRole([UserRole.ADMIN, UserRole.SUPERADMIN]));
    this.canDeleteUser.set(this.authService.hasRole(UserRole.SUPERADMIN));
    this.currentUser.set(this.authService.getCurrentUserValue());
  }

  loadRoles(): void {
    this.roleService.getAllRoles().subscribe({
      next: (roles) => this.roles.set(roles),
      error: () => {
        this.roleService.getRoles(1, 100).subscribe({
          next: (response) => this.roles.set(response.data as unknown as Role[]),
          error: () => this.errorMessage.set('Error al cargar los roles. Por favor intente más tarde.')
        });
      }
    });
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.userService.getUsers(this.currentPage(), this.pageSize()).subscribe({
      next: (response) => {
        this.users.set(response.data);
        this.total.set(response.total);
        this.totalPages.set(response.totalPages);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Error al cargar usuarios');
        this.isLoading.set(false);
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadUsers();
    }
  }

  createNewUser(): void {
    if (this.roles().length === 0) {
      this.errorMessage.set('Cargando roles... Por favor intente de nuevo en unos segundos.');
      this.loadRoles();
      return;
    }
    this.isEditMode.set(false);
    this.userFormData.set({ username: '', password: '', name: '', lastName: '', email: '', roleId: '', isActive: true });
    this.errorMessage.set('');
    this.showUserModal.set(true);
  }

  viewUser(user: UserListItem): void {
    this.selectedUser.set(user);
    this.showDetailModal.set(true);
  }

  editUser(user: UserListItem): void {
    if (this.roles().length === 0) {
      this.errorMessage.set('Cargando roles... Por favor intente de nuevo en unos segundos.');
      this.loadRoles();
      return;
    }
    this.isEditMode.set(true);
    this.userFormData.set({
      username: user.username,
      password: '',
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      roleId: user.role.id,
      isActive: user.isActive
    });
    this.selectedUser.set(user);
    this.errorMessage.set('');
    this.showUserModal.set(true);
  }

  saveUser(): void {
    if (!this.isUserFormValid()) return;
    this.isLoading.set(true);
    const form = this.userFormData();
    const selected = this.selectedUser();

    if (this.isEditMode() && selected) {
      const updateData: UpdateUserRequest = {
        name: form.name, lastName: form.lastName, email: form.email,
        roleId: form.roleId, isActive: form.isActive
      };
      this.userService.updateUser(selected.id, updateData).subscribe({
        next: () => {
          this.successMessage.set('Usuario actualizado exitosamente');
          this.showUserModal.set(false);
          setTimeout(() => { this.loadUsers(); this.successMessage.set(''); }, 1500);
        },
        error: (error) => { this.errorMessage.set(error.message || 'Error al actualizar usuario'); this.isLoading.set(false); }
      });
    } else {
      this.userService.createUser(form).subscribe({
        next: () => {
          this.successMessage.set('Usuario creado exitosamente');
          this.showUserModal.set(false);
          setTimeout(() => { this.loadUsers(); this.successMessage.set(''); }, 1500);
        },
        error: (error) => { this.errorMessage.set(error.message || 'Error al crear usuario'); this.isLoading.set(false); }
      });
    }
  }

  deleteUser(user: UserListItem): void {
    if (user.username === this.currentUser()?.username) {
      this.errorMessage.set('No puedes eliminar tu propio usuario');
      return;
    }
    this.userToDelete.set(user);
    this.confirmAction.set({
      title: 'Confirmar eliminación',
      message: `¿Está seguro de que desea eliminar al usuario "${user.username}"? Esta acción no se puede deshacer.`
    });
    this.showConfirmModal.set(true);
  }

  confirmDelete(): void {
    const target = this.userToDelete();
    if (!target) return;
    this.isLoading.set(true);
    this.userService.deleteUser(target.id).subscribe({
      next: () => {
        this.successMessage.set(`Usuario "${target.username}" eliminado exitosamente`);
        this.showConfirmModal.set(false);
        this.userToDelete.set(null);
        setTimeout(() => { this.loadUsers(); this.successMessage.set(''); }, 1500);
      },
      error: (error) => { this.errorMessage.set(error.message || 'Error al eliminar el usuario'); this.isLoading.set(false); }
    });
  }

  toggleActive(user: UserListItem): void {
    this.isLoading.set(true);
    this.userService.toggleActive(user.id).subscribe({
      next: () => {
        const action = user.isActive ? 'desactivado' : 'activado';
        this.successMessage.set(`Usuario ${action} exitosamente`);
        setTimeout(() => { this.loadUsers(); this.successMessage.set(''); }, 1500);
      },
      error: (error) => { this.errorMessage.set(error.message || 'Error al cambiar el estado'); this.isLoading.set(false); }
    });
  }

  closeUserModal(): void {
    this.showUserModal.set(false);
    this.isEditMode.set(false);
    this.selectedUser.set(null);
    this.userFormData.set({ username: '', password: '', name: '', lastName: '', email: '', roleId: '', isActive: true });
  }

  closeConfirmModal(): void {
    this.showConfirmModal.set(false);
    this.userToDelete.set(null);
  }

  closeDetailModal(): void {
    this.showDetailModal.set(false);
    this.selectedUser.set(null);
  }

  updateUserForm(field: string, value: any): void {
    this.userFormData.set({
      ...this.userFormData(),
      [field]: value
    });
  }

  isUserFormValid(): boolean {
    const form = this.userFormData();
    if (this.isEditMode()) {
      return !!(form.name && form.lastName && form.email && form.roleId);
    }
    return !!(form.username && form.password && form.name && form.lastName && form.email && form.roleId);
  }

  getRoleBadgeClass(roleName: string): string {
    return roleName.toLowerCase();
  }

  formatDate(date: Date | string | null | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-HN', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }
}
