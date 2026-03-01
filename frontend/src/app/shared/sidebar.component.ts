import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SidebarService } from '../services/sidebar.service';
import { AuthService } from '../services/auth.service';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  queryParams?: Record<string, string>;
  active?: boolean;
  children?: MenuItem[];
  expanded?: boolean;
}

interface MenuSection {
  title: string | null;
  requiredRoles: string[];  // [] = visible para todos los autenticados
  items: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="sidebar" [class.collapsed]="sidebarService.isCollapsed$()">
      <!-- Logo Section -->
      <div class="sidebar-header">
        <div class="logo">
          @if (!sidebarService.isCollapsed$()) {
            <span class="logo-text">NEXOS Labs</span>
          } @else {
            <span class="logo-text-collapsed">NL</span>
          }
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="sidebar-nav" id="sidebarNavigation" aria-label="Navegación principal">
        <ul class="nav-list" role="list">
          @for (section of visibleSections; track section.title) {
            <!-- Separador de sección -->
            @if (section.title && !sidebarService.isCollapsed$()) {
              <li class="nav-section-title" role="none">
                <span>{{ section.title }}</span>
              </li>
            } @else if (section.title && sidebarService.isCollapsed$()) {
              <li class="nav-section-divider" role="none"></li>
            }

            @for (item of section.items; track item.label) {
              <li class="nav-item"
                  [class.active]="item.active"
                  [class.has-children]="item.children && item.children!.length > 0"
                  [class.expanded]="item.expanded"
                  [attr.title]="sidebarService.isCollapsed$() ? item.label : null"
                  role="none">

                <button class="nav-link"
                   type="button"
                   (click)="toggleMenu(item)"
                   [attr.aria-expanded]="item.children && item.children!.length > 0 ? !!item.expanded : null"
                   [attr.aria-controls]="item.children && item.children!.length > 0 ? getSubmenuId(item.label) : null"
                   [attr.aria-current]="item.active ? 'page' : null">
                  <i class="nav-icon" [class]="item.icon"></i>
                  @if (!sidebarService.isCollapsed$()) {
                    <span class="nav-text">{{ item.label }}</span>
                    @if (item.children && item.children!.length > 0) {
                      <i class="expand-icon fa fa-chevron-down" [class.rotated]="item.expanded"></i>
                    }
                  }
                </button>

                <!-- Submenu -->
                @if (item.children && item.children!.length > 0 && item.expanded && !sidebarService.isCollapsed$()) {
                  <ul class="submenu"
                      [attr.id]="getSubmenuId(item.label)"
                      role="list"
                      [attr.aria-label]="'Submenú ' + item.label">
                    @for (child of item.children; track child.label) {
                      <li class="submenu-item" [class.active]="child.active" role="none">
                        <button class="submenu-link" type="button"
                                (click)="navigateTo(child.route!, child.queryParams)"
                                [attr.aria-current]="child.active ? 'page' : null">
                          <i class="submenu-icon fa fa-circle-o"></i>
                          <span class="submenu-text">{{ child.label }}</span>
                        </button>
                      </li>
                    }
                  </ul>
                }
              </li>
            }
          }
        </ul>
      </nav>
    </div>
  `,
  styles: [`
    .sidebar {
      width: 250px;
      height: 100vh;
      background: var(--color-sidebar-bg);
      position: fixed;
      left: 0;
      top: 0;
      z-index: 1000;
      box-shadow: 2px 0 10px var(--color-shadow);
      transition: width 0.3s ease;
      color: var(--color-sidebar-text);
      overflow-y: auto;
      overflow-x: hidden;
    }

    .sidebar.collapsed {
      width: 70px;
    }

    .sidebar-header {
      padding: 20px;
      border-bottom: 1px solid var(--color-sidebar-border);
    }

    .logo {
      text-align: center;
    }

    .logo-text {
      color: var(--color-sidebar-text);
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 1px;
      transition: opacity 0.3s ease;
    }

    .logo-text-collapsed {
      color: var(--color-sidebar-text);
      font-size: 20px;
      font-weight: bold;
      letter-spacing: 1px;
    }

    .sidebar-nav {
      padding-top: 10px;
    }

    .nav-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    /* Títulos de sección */
    .nav-section-title {
      padding: 14px 20px 4px 20px;
      font-size: 10px;
      font-weight: 700;
      color: var(--color-sidebar-icon);
      text-transform: uppercase;
      letter-spacing: 1px;
      cursor: default;
      user-select: none;
    }

    .nav-section-divider {
      height: 1px;
      background-color: var(--color-sidebar-border);
      margin: 8px 10px;
    }

    .nav-item {
      margin-bottom: 2px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .nav-item:hover {
      background-color: var(--color-sidebar-hover);
    }

    .nav-item.active {
      background-color: var(--color-sidebar-active);
      border-right: 3px solid var(--color-sidebar-text);
    }

    .nav-link {
      display: flex;
      align-items: center;
      padding: 12px 20px;
      color: var(--color-sidebar-text);
      text-decoration: none;
      transition: all 0.3s ease;
      background: none;
      border: none;
      width: 100%;
      text-align: left;
      font: inherit;
      cursor: pointer;
    }

    .nav-icon {
      width: 20px;
      height: 20px;
      margin-right: 12px;
      font-size: 18px;
      color: var(--color-sidebar-icon);
      flex-shrink: 0;
    }

    .nav-text {
      font-size: 14px;
      font-weight: 500;
      transition: opacity 0.3s ease;
      white-space: nowrap;
      overflow: hidden;
      flex: 1;
    }

    .sidebar.collapsed .nav-text {
      opacity: 0;
      width: 0;
    }

    .sidebar.collapsed .nav-link {
      justify-content: center;
      padding: 12px 10px;
    }

    .sidebar.collapsed .nav-icon {
      margin-right: 0;
    }

    /* Submenu */
    .nav-item.has-children .nav-link {
      position: relative;
    }

    .expand-icon {
      margin-left: auto;
      font-size: 12px;
      transition: transform 0.3s ease;
      color: var(--color-sidebar-text);
    }

    .expand-icon.rotated {
      transform: rotate(180deg);
    }

    .submenu {
      list-style: none;
      padding: 0;
      margin: 0;
      background-color: var(--color-sidebar-hover);
      border-left: 3px solid var(--color-sidebar-border);
      animation: slideDown 0.3s ease;
    }

    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-10px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .submenu-item {
      margin: 0;
      transition: all 0.3s ease;
    }

    .submenu-item:hover {
      background-color: var(--color-sidebar-active);
    }

    .submenu-item.active {
      background-color: var(--color-sidebar-active);
      border-left: 3px solid var(--color-sidebar-text);
    }

    .submenu-link {
      display: flex;
      align-items: center;
      padding: 10px 20px 10px 36px;
      color: var(--color-sidebar-text);
      text-decoration: none;
      transition: all 0.3s ease;
      font-size: 13px;
      background: none;
      border: none;
      width: 100%;
      text-align: left;
      font: inherit;
      cursor: pointer;
    }

    .submenu-icon {
      width: 8px;
      height: 8px;
      margin-right: 12px;
      font-size: 8px;
      color: var(--color-sidebar-icon);
    }

    .submenu-text {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Font Awesome Icons Fallback */
    .fa-home::before            { content: '🏠'; }
    .fa-users::before           { content: '👥'; }
    .fa-user-md::before         { content: '👨‍⚕️'; }
    .fa-tint::before            { content: '🩸'; }
    .fa-vial::before            { content: '🧪'; }
    .fa-flask::before           { content: '⚗️'; }
    .fa-microscope::before      { content: '🔬'; }
    .fa-cog::before             { content: '⚙️'; }
    .fa-clipboard-list::before  { content: '📋'; }
    .fa-list-check::before      { content: '✅'; }
    .fa-layer-group::before     { content: '📚'; }
    .fa-chevron-down::before    { content: '▼'; }
    .fa-circle-o::before        { content: '◦'; }
    .fa-history::before         { content: '📜'; }
    .fa-plus-circle::before     { content: '➕'; }
    .fa-folder-open::before     { content: '📂'; }
    .fa-dna::before             { content: '🧬'; }
    .fa-sliders::before         { content: '🎛️'; }
    .fa-tag::before             { content: '🎁'; }
    .fa-stool::before           { content: '🔭'; }

    /* Responsive */
    @media (max-width: 768px) {
      .sidebar {
        z-index: 1001;
      }

      .sidebar.collapsed {
        width: 0;
        overflow: hidden;
      }
    }
  `]
})
export class SidebarComponent implements OnInit, OnDestroy {
  protected sidebarService: SidebarService;
  private authService: AuthService;
  private router: Router;
  private userSub?: Subscription;

  visibleSections: MenuSection[] = [];

  private readonly allSections: MenuSection[] = [
    {
      title: null,
      requiredRoles: [],
      items: [
        { label: 'Dashboard', icon: 'fa fa-home', route: '/dashboard' }
      ]
    },
    {
      title: 'Recepción',
      requiredRoles: [],
      items: [
        { label: 'Nueva Orden',       icon: 'fa fa-plus-circle',    route: '/laboratory-orders/create' },
        { label: 'Órdenes de Trabajo', icon: 'fa fa-clipboard-list', route: '/laboratory-orders' },
        { label: 'Pacientes',          icon: 'fa fa-users',          route: '/patients' },
        { label: 'Médicos',            icon: 'fa fa-user-md',        route: '/doctors' }
      ]
    },
    {
      title: 'Laboratorio',
      requiredRoles: ['TECNICO', 'ADMIN', 'SUPERADMIN'],
      items: [
        { label: 'Pendientes de Resultado', icon: 'fa fa-list-check',     route: '/laboratory-orders', queryParams: { status: 'InProcess' } },
        { label: 'Hemogramas',             icon: 'fa fa-tint',           route: '/dymind-dh36-results' },
        { label: 'Pruebas Especiales',     icon: 'fa fa-vial',           route: '/lab-ichroma' },
        { label: 'Orina',                  icon: 'fa fa-flask',          route: '/urine-tests' },
        { label: 'Heces',                  icon: 'fa fa-microscope',     route: '/stool-tests' },
        { label: 'Historial de Pacientes', icon: 'fa fa-history',        route: '/patient-history' }
      ]
    },
    {
      title: 'Catálogo',
      requiredRoles: ['ADMIN', 'SUPERADMIN'],
      items: [
        { label: 'Secciones de Pruebas',  icon: 'fa fa-folder-open',  route: '/test-sections' },
        { label: 'Definiciones de Pruebas', icon: 'fa fa-dna',        route: '/test-definitions' },
        { label: 'Perfiles de Pruebas',   icon: 'fa fa-layer-group',  route: '/test-profiles' },
        { label: 'Tipos de Respuesta',    icon: 'fa fa-sliders',      route: '/test-response-types' },
        { label: 'Promociones',           icon: 'fa fa-tag',          route: '/promotions' }
      ]
    }
  ];

  constructor(sidebarService: SidebarService, authService: AuthService, router: Router) {
    this.sidebarService = sidebarService;
    this.authService = authService;
    this.router = router;
  }

  ngOnInit(): void {
    this.sidebarService.initializeForMobile();

    this.userSub = this.authService.currentUser$.subscribe(() => {
      this.buildVisibleSections();
    });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  private buildVisibleSections(): void {
    this.visibleSections = this.allSections.filter(section =>
      section.requiredRoles.length === 0 ||
      this.authService.hasAnyRole(section.requiredRoles)
    );
  }

  navigateTo(route: string, queryParams?: Record<string, string>): void {
    this.updateActiveState(route);
    this.router.navigate([route], queryParams ? { queryParams } : {});
  }

  toggleMenu(item: MenuItem): void {
    if (item.children && item.children.length > 0) {
      item.expanded = !item.expanded;
    } else if (item.route) {
      this.navigateTo(item.route, item.queryParams);
    }
  }

  private updateActiveState(route: string): void {
    for (const section of this.visibleSections) {
      for (const item of section.items) {
        item.active = item.route === route;
        if (item.children) {
          for (const child of item.children) {
            child.active = child.route === route;
          }
          if (item.children.some(c => c.route === route)) {
            item.expanded = true;
          }
        }
      }
    }
  }

  getSubmenuId(label: string): string {
    return 'submenu-' + label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
}
