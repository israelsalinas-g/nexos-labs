import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './shared/sidebar.component';
import { HeaderComponent } from './shared/header.component';
import { ToastContainerComponent } from './shared/toast-container.component';
import { SidebarService } from './services/sidebar.service';
import { ThemeService } from './services/theme.service';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, SidebarComponent, HeaderComponent, ToastContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Sistema de Resultados de Laboratorio');
  protected showLayout = signal(true);
  
  private router = inject(Router);
  private themeService = inject(ThemeService);
  
  constructor(protected sidebarService: SidebarService) {
    // Force theme initialization on boot
    this.themeService.theme();
    // Detectar cuando la ruta cambia y actualizar showLayout
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map((event: NavigationEnd | any) => event.url)
      )
      .subscribe(url => {
        // No mostrar sidebar y header en login y unauthorized
        this.showLayout.set(!url.includes('/login') && !url.includes('/unauthorized'));
      });
  }
}
