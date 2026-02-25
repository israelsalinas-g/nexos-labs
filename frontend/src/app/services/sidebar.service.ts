import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private _isCollapsed = signal(false);
  
  // Getter para el estado colapsado
  get isCollapsed() {
    return this._isCollapsed();
  }

  // Signal readonly para componentes
  get isCollapsed$() {
    return this._isCollapsed.asReadonly();
  }

  // Toggle del sidebar
  toggle(): void {
    this._isCollapsed.update(current => !current);
  }

  // Colapsar el sidebar
  collapse(): void {
    this._isCollapsed.set(true);
  }

  // Expandir el sidebar
  expand(): void {
    this._isCollapsed.set(false);
  }

  // Inicializar en modo colapsado en mobile
  initializeForMobile(): void {
    if (window.innerWidth <= 768) {
      this.collapse();
    }
  }
}