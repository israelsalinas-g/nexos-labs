import { Component, OnInit, inject } from '@angular/core';
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
 * Componente de lista de usuarios
 * Muestra todos los usuarios del sistema con paginación, crear, editar y eliminar
 * Requiere roles: ADMIN, SUPERADMIN
 */
@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private roleService = inject(RoleService);

  users: UserListItem[] = [];
  roles: Role[] = [];
  currentPage = 1;
  pageSize = 4;
  total = 0;
  totalPages = 0;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Permisos del usuario actual
  canCreateUser = false;
  canEditUser = false;
  canDeleteUser = false;
  currentUser: UserAuth | null = null;

  // Modal states
  showUserModal = false;
  showConfirmModal = false;
  showDetailModal = false;

  // Form data
  userFormData: CreateUserRequest = {
    username: '',
    password: '',
    name: '',
    lastName: '',
    email: '',
    roleId: '',
    isActive: true
  };

  // Selected user for delete or detail
  selectedUser: UserListItem | null = null;
  userToDelete: UserListItem | null = null;

  // Confirm action
  confirmAction = {
    title: '',
    message: ''
  };

  isEditMode = false;

  ngOnInit(): void {
    this.checkPermissions();
    this.loadRoles();
    this.loadUsers();
  }

  checkPermissions(): void {
    this.canCreateUser = this.authService.hasAnyRole([UserRole.ADMIN, UserRole.SUPERADMIN]);
    this.canEditUser = this.authService.hasAnyRole([UserRole.ADMIN, UserRole.SUPERADMIN]);
    this.canDeleteUser = this.authService.hasRole(UserRole.SUPERADMIN);
    this.currentUser = this.authService.getCurrentUserValue();
  }

  loadRoles(): void {
    this.roleService.getAllRoles().subscribe({
      next: (roles) => {
        console.log('Roles cargados:', roles);
        this.roles = roles;
      },
      error: (error) => {
        console.error('Error cargando roles directamente, intentando con paginación:', error);
        // Fallback: intentar con paginación si /all no funciona
        this.roleService.getRoles(1, 100).subscribe({
          next: (response) => {
            console.log('Roles cargados con paginación:', response.data);
            this.roles = response.data as unknown as Role[];
          },
          error: (paginationError) => {
            console.error('Error cargando roles con paginación:', paginationError);
            this.errorMessage = 'Error al cargar los roles. Por favor intente más tarde.';
          }
        });
      }
    });
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.userService.getUsers(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.users = response.data;
        this.total = response.total;
        this.totalPages = response.totalPages;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando usuarios:', error);
        this.errorMessage = error.message || 'Error al cargar usuarios';
        this.isLoading = false;
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadUsers();
    }
  }

  createNewUser(): void {
    if (this.roles.length === 0) {
      this.errorMessage = 'Cargando roles... Por favor intente de nuevo en unos segundos.';
      console.warn('Roles no disponibles aún. Intentando cargar...');
      this.loadRoles();
      return;
    }
    
    this.isEditMode = false;
    this.userFormData = {
      username: '',
      password: '',
      name: '',
      lastName: '',
      email: '',
      roleId: '',
      isActive: true
    };
    this.errorMessage = '';
    this.showUserModal = true;
    console.log('Modal abierto. Roles disponibles:', this.roles);
  }

  viewUser(user: UserListItem): void {
    this.selectedUser = user;
    this.showDetailModal = true;
  }

  editUser(user: UserListItem): void {
    if (this.roles.length === 0) {
      this.errorMessage = 'Cargando roles... Por favor intente de nuevo en unos segundos.';
      console.warn('Roles no disponibles aún. Intentando cargar...');
      this.loadRoles();
      return;
    }
    
    this.isEditMode = true;
    this.userFormData = {
      username: user.username,
      password: '',
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      roleId: user.role.id,
      isActive: user.isActive
    };
    this.selectedUser = user;
    this.errorMessage = '';
    this.showUserModal = true;
    console.log('Modal de edición abierto. Roles disponibles:', this.roles);
  }

  saveUser(): void {
    if (!this.isUserFormValid()) return;

    this.isLoading = true;

    if (this.isEditMode && this.selectedUser) {
      const updateData: UpdateUserRequest = {
        name: this.userFormData.name,
        lastName: this.userFormData.lastName,
        email: this.userFormData.email,
        roleId: this.userFormData.roleId,
        isActive: this.userFormData.isActive
      };

      this.userService.updateUser(this.selectedUser.id, updateData).subscribe({
        next: () => {
          this.successMessage = 'Usuario actualizado exitosamente';
          this.showUserModal = false;
          setTimeout(() => {
            this.loadUsers();
            this.successMessage = '';
          }, 1500);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Error al actualizar el usuario';
          this.isLoading = false;
        }
      });
    } else {
      const createData: CreateUserRequest = {
        username: this.userFormData.username,
        password: this.userFormData.password,
        name: this.userFormData.name,
        lastName: this.userFormData.lastName,
        email: this.userFormData.email,
        roleId: this.userFormData.roleId,
        isActive: true
      };

      this.userService.createUser(createData).subscribe({
        next: () => {
          this.successMessage = 'Usuario creado exitosamente';
          this.showUserModal = false;
          setTimeout(() => {
            this.loadUsers();
            this.successMessage = '';
          }, 1500);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Error al crear el usuario';
          this.isLoading = false;
        }
      });
    }
  }

  deleteUser(user: UserListItem): void {
    if (user.username === this.currentUser?.username) {
      this.errorMessage = 'No puedes eliminar tu propio usuario';
      return;
    }

    this.userToDelete = user;
    this.confirmAction = {
      title: 'Confirmar eliminación',
      message: `¿Está seguro de que desea eliminar al usuario "${user.username}"? Esta acción no se puede deshacer.`
    };
    this.showConfirmModal = true;
  }

  confirmDelete(): void {
    if (!this.userToDelete) return;

    this.isLoading = true;
    this.userService.deleteUser(this.userToDelete.id).subscribe({
      next: () => {
        this.successMessage = `Usuario "${this.userToDelete?.username}" eliminado exitosamente`;
        this.showConfirmModal = false;
        this.userToDelete = null;
        setTimeout(() => {
          this.loadUsers();
          this.successMessage = '';
        }, 1500);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error al eliminar el usuario';
        this.isLoading = false;
      }
    });
  }

  toggleActive(user: UserListItem): void {
    this.isLoading = true;
    this.userService.toggleActive(user.id).subscribe({
      next: () => {
        const action = user.isActive ? 'desactivado' : 'activado';
        this.successMessage = `Usuario ${action} exitosamente`;
        setTimeout(() => {
          this.loadUsers();
          this.successMessage = '';
        }, 1500);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Error al cambiar el estado del usuario';
        this.isLoading = false;
      }
    });
  }

  closeUserModal(): void {
    this.showUserModal = false;
    this.isEditMode = false;
    this.selectedUser = null;
    this.userFormData = {
      username: '',
      password: '',
      name: '',
      lastName: '',
      email: '',
      roleId: '',
      isActive: true
    };
  }

  closeConfirmModal(): void {
    this.showConfirmModal = false;
    this.userToDelete = null;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedUser = null;
  }

  isUserFormValid(): boolean {
    if (this.isEditMode) {
      return !!(this.userFormData.name && 
             this.userFormData.lastName && 
             this.userFormData.email && 
             this.userFormData.roleId);
    } else {
      return !!(this.userFormData.username && 
             this.userFormData.password && 
             this.userFormData.name && 
             this.userFormData.lastName && 
             this.userFormData.email && 
             this.userFormData.roleId);
    }
  }

  getRoleBadgeClass(roleName: string): string {
    return roleName.toLowerCase();
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
