import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SidebarService } from '../services/sidebar.service';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  active?: boolean;
  children?: MenuItem[];
  expanded?: boolean;
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
          <span class="logo-text" *ngIf="!sidebarService.isCollapsed$()">NEXOS Labs</span>
          <span class="logo-text-collapsed" *ngIf="sidebarService.isCollapsed$()">NL</span>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="sidebar-nav" id="sidebarNavigation" aria-label="Navegación principal">
        <ul class="nav-list" role="list">
          <li class="nav-item" *ngFor="let item of menuItems" 
              [class.active]="item.active"
              [class.has-children]="item.children && item.children.length > 0"
              [class.expanded]="item.expanded"
              [attr.title]="sidebarService.isCollapsed$() ? item.label : null"
              role="none">
            
            <!-- Menu item with optional submenu -->
            <button class="nav-link" 
               type="button"
               (click)="toggleMenu(item)"
               [attr.aria-expanded]="item.children && item.children.length > 0 ? !!item.expanded : null"
               [attr.aria-controls]="item.children && item.children.length > 0 ? getSubmenuId(item.label) : null"
               [attr.aria-current]="item.active ? 'page' : null">
              <i class="nav-icon" [class]="item.icon"></i>
              <span class="nav-text" *ngIf="!sidebarService.isCollapsed$()">{{ item.label }}</span>
              <i class="expand-icon fa fa-chevron-down" 
                 *ngIf="item.children && item.children.length > 0 && !sidebarService.isCollapsed$()"
                 [class.rotated]="item.expanded"></i>
            </button>

            <!-- Submenu -->
            <ul class="submenu" *ngIf="item.children && item.children.length > 0 && item.expanded && !sidebarService.isCollapsed$()"
                [attr.id]="getSubmenuId(item.label)"
                role="list"
                [attr.aria-label]="'Submenú ' + item.label">
              <li class="submenu-item" *ngFor="let child of item.children" 
                  [class.active]="child.active"
                  role="none">
                <button class="submenu-link" type="button" (click)="navigateTo(child.route!)" [attr.aria-current]="child.active ? 'page' : null">
                  <i class="submenu-icon fa fa-circle-o"></i>
                  <span class="submenu-text">{{ child.label }}</span>
                </button>
              </li>
            </ul>
          </li>
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
      padding-top: 20px;
    }

    .nav-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .nav-item {
      margin-bottom: 5px;
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
      padding: 15px 20px;
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
    }

    .nav-text {
      font-size: 14px;
      font-weight: 500;
      transition: opacity 0.3s ease;
      white-space: nowrap;
      overflow: hidden;
    }

    .sidebar.collapsed .nav-text {
      opacity: 0;
      width: 0;
    }

    .sidebar.collapsed .nav-link {
      justify-content: center;
      padding: 15px 10px;
    }

    .sidebar.collapsed .nav-icon {
      margin-right: 0;
    }

    /* Submenu Styles */
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
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
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
      padding: 12px 20px 12px 40px;
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

    .cursor-pointer {
      cursor: pointer;
    }

    /* Font Awesome Icons Fallback */
    .fa-home::before { content: '🏠'; }
    .fa-users::before { content: '👥'; }
    .fa-user-md::before { content: '👨‍⚕️'; }
    .fa-tint::before { content: '🩸'; }
    .fa-vial::before { content: '🧪'; }
    .fa-flask::before { content: '⚗️'; }
    .fa-microscope::before { content: '🔬'; }
    .fa-cog::before { content: '⚙️'; }
    .fa-clipboard-list::before { content: '📋'; }
    .fa-list-check::before { content: '✅'; }
    .fa-layer-group::before { content: '📚'; }
    .fa-chevron-down::before { content: '▼'; }
    .fa-circle-o::before { content: '◦'; }
    .fa-history::before { content: '📜'; }

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
export class SidebarComponent implements OnInit {
  constructor(
    private router: Router,
    protected sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    // Inicializar para mobile si es necesario
    this.sidebarService.initializeForMobile();
  }

  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'fa fa-home',
      route: '/dashboard',
      active: false
    },
    {
      label: 'Hemogramas',
      icon: 'fa fa-tint',
      route: '/dymind-dh36-results',
      active: false
    },
    {
      label: 'Pruebas especiales',
      icon: 'fa fa-vial',
      route: '/lab-ichroma',
      active: false
    },
    {
      label: 'Orina',
      icon: 'fa fa-flask',
      route: '/urine-tests',
      active: false
    },
    {
      label: 'Heces',
      icon: 'fa fa-microscope',
      route: '/stool-tests',
      active: false
    },
    // {
    //   label: 'Órdenes de laboratorio',
    //   icon: 'fa fa-clipboard-list',
    //   route: '/laboratory-orders',
    //   active: false
    // },
    {
      label: 'Pacientes',
      icon: 'fa fa-users',
      route: '/patients',
      active: false
    },
    {
      label: 'Médicos',
      icon: 'fa fa-user-md',
      route: '/doctors',
      active: false
    },
    {
      label: 'Historial de Pacientes',
      icon: 'fa fa-history',
      route: '/patient-history',
      active: false
    }
  ];

  navigateTo(route: string): void {
    // Update active state recursively
    this.updateActiveState(this.menuItems, route);
    this.router.navigate([route]);
  }

  toggleMenu(item: MenuItem): void {
    // Si tiene children, toggle la expansión
    if (item.children && item.children.length > 0) {
      item.expanded = !item.expanded;
    } else if (item.route) {
      // Si no tiene children pero tiene route, navegar
      this.navigateTo(item.route);
    }
  }

  private updateActiveState(items: MenuItem[], route: string): void {
    items.forEach(item => {
      // Buscar en el item actual
      if (item.route === route) {
        item.active = true;
      } else {
        item.active = false;
      }

      // Buscar en los children
      if (item.children && item.children.length > 0) {
        const foundInChildren = this.findInChildren(item.children, route);
        if (foundInChildren) {
          item.expanded = true;
        }
        this.updateActiveState(item.children, route);
      }
    });
  }

  private findInChildren(children: MenuItem[], route: string): boolean {
    return children.some(child => child.route === route || 
      (child.children && this.findInChildren(child.children, route)));
  }

  getSubmenuId(label: string): string {
    return 'submenu-' + label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
}
