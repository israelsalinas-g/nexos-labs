import { Component, inject } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [NgFor, NgClass, NgIf],
  template: `
    <div class="toast-container" *ngIf="toasts().length > 0">
      <div
        class="toast"
        *ngFor="let toast of toasts()"
        [ngClass]="toast.type"
        (click)="dismiss(toast.id)"
        role="status"
        aria-live="polite"
      >
        <div class="toast-content">
          <strong *ngIf="toast.title">{{ toast.title }}</strong>
          <span>{{ toast.message }}</span>
          <small *ngIf="toast.details">{{ toast.details }}</small>
        </div>
        <button type="button" class="toast-close" aria-label="Cerrar" (click)="dismiss(toast.id); $event.stopPropagation()">×</button>
      </div>
    </div>
  `,
  styleUrls: ['./toast-container.component.css']
})
export class ToastContainerComponent {
  private readonly toastService = inject(ToastService);
  readonly toasts = this.toastService.toasts;

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }
}
