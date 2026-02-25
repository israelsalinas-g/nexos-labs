import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarService } from '../services/sidebar.service';
import { AuthService } from '../services/auth.service';
import { UserAuth } from '../models/auth.interface';
import { ChangePasswordDialogComponent } from './change-password-dialog.component';
import { ChangeAvatarDialogComponent } from './change-avatar-dialog.component';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ChangePasswordDialogComponent, ChangeAvatarDialogComponent],
  template: `
    <header class="header" [style.left.px]="sidebarService.isCollapsed$() ? 70 : 250">
      <div class="header-content">
        <div class="header-left">
          <button
            class="hamburger-btn"
            type="button"
            (click)="toggleSidebar()"
            aria-label="Alternar menú lateral"
            [attr.aria-expanded]="!sidebarService.isCollapsed$()"
            aria-controls="sidebarNavigation"
          >
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
          </button>
          <h1 class="header-title">Sistema Gestor de Resultados Clínicos</h1>
        </div>
        
        <div class="header-right">
          <button
            type="button"
            class="theme-toggle"
            (click)="toggleTheme()"
            [attr.aria-label]="themeLabel"
            [attr.title]="themeLabel"
            [attr.aria-pressed]="themeService.theme() === 'dark'"
          >
            <span class="theme-icon">
              {{ themeService.theme() === 'dark' ? '🌙' : '☀️' }}
            </span>
            <span class="theme-label">{{ themeService.theme() === 'dark' ? 'Oscuro' : 'Claro' }}</span>
          </button>

          <div class="header-user" (clickOutside)="closeDropdown()" aria-label="Menú de usuario" role="navigation">
            <div class="user-info">
              <span class="user-name">{{ currentUser?.username || 'Usuario' }}</span>
              <span class="user-role">{{ currentUser?.role || 'Cargando...' }}</span>
            </div>
            <div class="user-avatar" aria-hidden="true">
              @if (currentUser && currentUser.avatar) {
                <img [src]="currentUser.avatar" alt="User Avatar" class="avatar-img">
              } @else {
                <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiB2aWV3Qm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjIiIGQ9Ik0yMCAyMXYtMmE0IDQgMCAwIDAtNC00SDhhNCA0IDAgMCAwLTQgNHYyTTEyIDExYTQgNCAwIDEgMCAwLTggNCA0IDAgMCAwIDAgOFoiLz48L3N2Zz4=" 
                     alt="User Avatar" class="avatar-img">
              }
            </div>
            <button
              class="dropdown-btn"
              type="button"
              (click)="toggleDropdown()"
              aria-haspopup="menu"
              [attr.aria-expanded]="dropdownOpen"
              aria-controls="headerUserMenu"
              aria-label="Abrir menú de usuario"
            >
              <i class="fa" [class.fa-chevron-down]="!dropdownOpen" [class.fa-chevron-up]="dropdownOpen"></i>
            </button>

            <!-- Dropdown Menu -->
            @if (dropdownOpen) {
              <div class="dropdown-menu" id="headerUserMenu" role="menu" aria-label="Opciones de usuario">
              <!-- Perfil de Usuario -->
              <div class="dropdown-section">
                <button class="dropdown-item" type="button" role="menuitem" (click)="navigateTo('/profile')">
                  <span class="item-icon">👤</span>
                  <span>Mi Perfil</span>
                </button>
                <button class="dropdown-item" type="button" role="menuitem" (click)="openChangeAvatarDialog()">
                  <span class="item-icon">🖼️</span>
                  <span>Cambiar Avatar</span>
                </button>
                <button class="dropdown-item" type="button" role="menuitem" (click)="openChangePasswordDialog()">
                  <span class="item-icon">🔒</span>
                  <span>Cambiar Contraseña</span>
                </button>
              </div>

              <!-- Administración (solo para ADMIN y SUPERADMIN) -->
              @if (canAccessAdmin) {
                <div class="dropdown-divider"></div>
                <div class="dropdown-section">
                  <div class="dropdown-section-title">Administración</div>
                  <button class="dropdown-item" type="button" role="menuitem" (click)="navigateTo('/users')">
                    <span class="item-icon">👥</span>
                    <span>Usuarios</span>
                  </button>
                  @if (canAccessRoles) {
                    <button class="dropdown-item" type="button" role="menuitem" (click)="navigateTo('/roles')">
                      <span class="item-icon">🔑</span>
                      <span>Roles y Permisos</span>
                    </button>
                  }
                </div>
              }

              <!-- Configuración -->
              <div class="dropdown-divider"></div>
              <div class="dropdown-section">
                <div class="dropdown-section-title">Configuración</div>
                <button class="dropdown-item" type="button" role="menuitem" (click)="navigateTo('/test-sections')">
                  <span class="item-icon">📂</span>
                  <span>Secciones de Pruebas</span>
                </button>
                <button class="dropdown-item" type="button" role="menuitem" (click)="navigateTo('/test-definitions')">
                  <span class="item-icon">🧪</span>
                  <span>Definiciones de Pruebas</span>
                </button>
                <button class="dropdown-item" type="button" role="menuitem" (click)="navigateTo('/test-profiles')">
                  <span class="item-icon">📋</span>
                  <span>Perfiles de Pruebas</span>
                </button>
              </div>

              <!-- Cerrar Sesión -->
              <div class="dropdown-divider"></div>
              <button class="dropdown-item logout" type="button" role="menuitem" (click)="logout()">
                <span class="item-icon">🚪</span>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          }
          </div>
        </div>
      </div>
    </header>

    <!-- Dialogs -->
    @if (showChangePasswordDialog()) {
      <app-change-password-dialog />
    }

    @if (showChangeAvatarDialog()) {
      <app-change-avatar-dialog />
    }
  `,
  styles: [`
    .header {
      height: 70px;
      background-color: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      box-shadow: 0 1px 3px 0 var(--color-shadow);
      position: fixed;
      top: 0;
      right: 0;
      z-index: 999;
      transition: left 0.3s ease;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 100%;
      padding: 0 30px;
      color: var(--color-text);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-title {
      font-size: 24px;
      font-weight: 600;
      color: var(--color-text);
      margin: 0;
    }

    .header-user {
      display: flex;
      align-items: center;
      gap: 15px;
      position: relative;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      text-align: right;
      color: var(--color-text);
    }

    .user-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text);
    }

    .user-role {
      font-size: 12px;
      color: var(--color-text-muted);
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: var(--color-surface-alt);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border: 1px solid var(--color-border);
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .dropdown-btn {
      background: none;
      border: none;
      color: var(--color-text-muted);
      cursor: pointer;
      padding: 5px;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .dropdown-btn:hover {
      background-color: var(--color-surface-alt);
      color: var(--color-text);
    }

    .fa-chevron-down::before {
      content: '▼';
      font-size: 10px;
    }

    .fa-chevron-up::before {
      content: '▲';
      font-size: 10px;
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      background: var(--color-surface);
      border-radius: 8px;
      box-shadow: 0 4px 20px var(--color-shadow);
      min-width: 250px;
      z-index: 1000;
      overflow: hidden;
      animation: dropdown-fade-in 0.2s ease;
      border: 1px solid var(--color-border);
    }

    @keyframes dropdown-fade-in {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .dropdown-section {
      padding: 8px 0;
    }

    .dropdown-section-title {
      padding: 8px 16px;
      font-size: 11px;
      font-weight: 600;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .dropdown-item {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: none;
      border: none;
      text-align: left;
      cursor: pointer;
      transition: all 0.2s;
      color: var(--color-text);
      font-size: 14px;
    }

    .dropdown-item:hover {
      background-color: var(--color-surface-alt);
    }

    .dropdown-item.logout {
      color: var(--color-danger);
    }

    .dropdown-item.logout:hover {
      background-color: var(--color-error-bg);
    }

    .item-icon {
      font-size: 18px;
      width: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .dropdown-divider {
      height: 1px;
      background-color: var(--color-border);
      margin: 4px 0;
    }

    .hamburger-btn {
      background: none;
      border: none;
      width: 40px;
      height: 40px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 4px;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .hamburger-btn:hover {
      background-color: var(--color-surface-alt);
    }

    .hamburger-line {
      width: 20px;
      height: 2px;
      background-color: var(--color-text-muted);
      border-radius: 1px;
      transition: all 0.3s ease;
    }

    .theme-toggle {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      border-radius: 999px;
      border: 1px solid var(--color-border);
      background-color: var(--color-surface);
      color: var(--color-text);
      font-size: 0.85rem;
      transition: background-color 0.2s ease, border-color 0.2s ease;
    }

    .theme-toggle:hover {
      background-color: var(--color-surface-alt);
      border-color: var(--color-primary);
    }

    .theme-icon {
      font-size: 1rem;
      line-height: 1;
    }

    .theme-label {
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.7rem;
    }

    @media (max-width: 768px) {
      .header {
        left: 0 !important;
      }

      .header-title {
        font-size: 18px;
      }

      .user-info {
        display: none;
      }

      .header-content {
        padding: 0 15px;
      }

      .theme-label {
        display: none;
      }
    }

    @media (max-width: 480px) {
      .header-title {
        font-size: 16px;
      }

      .hamburger-btn {
        width: 35px;
        height: 35px;
      }

      .hamburger-line {
        width: 18px;
      }
    }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  protected sidebarService = inject(SidebarService);
  protected themeService = inject(ThemeService);
  private authService = inject(AuthService);
  private router = inject(Router);

  dropdownOpen = false;
  currentUser: UserAuth | null = null;
  canAccessAdmin = false;
  canAccessRoles = false;
  
  showChangePasswordDialog = signal(false);
  showChangeAvatarDialog = signal(false);

  private dialogCloseListener?: EventListener;
  private avatarUpdatedListener?: EventListener;

  get themeLabel(): string {
    return this.themeService.theme() === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  ngOnInit(): void {
    // Suscribirse al usuario actual
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.canAccessAdmin = this.authService.hasAnyRole(['ADMIN', 'SUPERADMIN']);
      this.canAccessRoles = this.authService.hasRole('SUPERADMIN');
    });

    // Listener para cerrar dialogs
    this.dialogCloseListener = () => {
      this.showChangePasswordDialog.set(false);
      this.showChangeAvatarDialog.set(false);
    };
    window.addEventListener('closeDialog', this.dialogCloseListener);

    // Listener para actualizar avatar
    this.avatarUpdatedListener = ((event: CustomEvent) => {
      if (this.currentUser && event.detail?.avatar) {
        this.currentUser = { ...this.currentUser, avatar: event.detail.avatar };
      }
    }) as EventListener;
    window.addEventListener('avatarUpdated', this.avatarUpdatedListener);
  }

  ngOnDestroy(): void {
    if (this.dialogCloseListener) {
      window.removeEventListener('closeDialog', this.dialogCloseListener);
    }
    if (this.avatarUpdatedListener) {
      window.removeEventListener('avatarUpdated', this.avatarUpdatedListener);
    }
  }

  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown(): void {
    this.dropdownOpen = false;
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
    this.closeDropdown();
  }

  logout(): void {
    if (confirm('¿Está seguro de cerrar sesión?')) {
      this.authService.logout();
      this.closeDropdown();
    }
  }

  openChangePasswordDialog(): void {
    this.showChangePasswordDialog.set(true);
    this.closeDropdown();
  }

  openChangeAvatarDialog(): void {
    this.showChangeAvatarDialog.set(true);
    this.closeDropdown();
  }
}
