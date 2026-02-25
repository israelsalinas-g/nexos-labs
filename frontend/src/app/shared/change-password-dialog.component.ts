import { AfterViewInit, Component, ElementRef, HostListener, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ChangePasswordRequest } from '../models/auth.interface';

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" role="presentation" (click)="close()">
      <div
        #dialogContainer
        class="modal-content"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="dialogTitleId"
        [attr.aria-describedby]="dialogDescriptionId"
        tabindex="-1"
        (click)="$event.stopPropagation()"
      >
        <div class="modal-header">
          <h2 [id]="dialogTitleId">Cambiar Contraseña</h2>
          <button class="close-btn" (click)="close()" type="button" aria-label="Cerrar diálogo">
            <span>×</span>
          </button>
        </div>

        <form (ngSubmit)="onSubmit()" #passwordForm="ngForm">
          <div class="modal-body" [attr.id]="dialogDescriptionId">
            @if (errorMessage()) {
              <div class="alert alert-error" role="alert" aria-live="assertive">
                {{ errorMessage() }}
              </div>
            }

            @if (successMessage()) {
              <div class="alert alert-success" role="status" aria-live="polite">
                {{ successMessage() }}
              </div>
            }

            <div class="form-group">
              <label for="currentPassword">Contraseña Actual *</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                #firstField
                [(ngModel)]="formData.currentPassword"
                required
                [disabled]="isLoading()"
                class="form-control"
                placeholder="Ingrese su contraseña actual"
              />
            </div>

            <div class="form-group">
              <label for="newPassword">Nueva Contraseña *</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                [(ngModel)]="formData.newPassword"
                required
                minlength="6"
                [disabled]="isLoading()"
                class="form-control"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div class="form-group">
              <label for="confirmPassword">Confirmar Nueva Contraseña *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                [(ngModel)]="confirmPassword"
                required
                [disabled]="isLoading()"
                class="form-control"
                placeholder="Repita la nueva contraseña"
              />
            </div>

            @if (formData.newPassword && confirmPassword && formData.newPassword !== confirmPassword) {
              <div class="alert alert-warning" role="alert" aria-live="assertive">
                Las contraseñas no coinciden
              </div>
            }
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              (click)="close()"
              [disabled]="isLoading()"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              [disabled]="isLoading() || !passwordForm.form.valid || formData.newPassword !== confirmPassword"
            >
              @if (isLoading()) {
                <span>Cambiando...</span>
              } @else {
                <span>Cambiar Contraseña</span>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .modal-content {
      background: var(--color-surface);
      border-radius: 12px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 40px var(--color-shadow);
      border: 1px solid var(--color-border);
      animation: slideUp 0.3s ease;
      color: var(--color-text);
    }

    @keyframes slideUp {
      from {
        transform: translateY(30px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid var(--color-border);
      background-color: var(--color-surface);
    }

    .modal-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: var(--color-text);
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 32px;
      color: var(--color-text-muted);
      cursor: pointer;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background-color: var(--color-surface-alt);
      color: var(--color-text);
    }

    .modal-body {
      padding: 24px;
      color: var(--color-text);
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: var(--color-text);
      font-size: 14px;
    }

    .form-control {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--color-border);
      border-radius: 6px;
      font-size: 14px;
      transition: all 0.2s;
      box-sizing: border-box;
      background-color: var(--color-surface);
      color: var(--color-text);
    }

    .form-control:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.25);
    }

    .form-control:disabled {
      background-color: var(--color-surface-alt);
      cursor: not-allowed;
    }

    .alert {
      padding: 12px 16px;
      border-radius: 6px;
      margin-bottom: 20px;
      font-size: 14px;
    }

    .alert-error {
      background-color: var(--color-error-bg);
      color: var(--color-error-text);
      border: 1px solid var(--color-error-border);
    }

    .alert-success {
      background-color: rgba(34, 197, 94, 0.15);
      color: #065f46;
      border: 1px solid rgba(34, 197, 94, 0.35);
    }

    .alert-warning {
      background-color: rgba(249, 115, 22, 0.15);
      color: #92400e;
      border: 1px solid rgba(249, 115, 22, 0.35);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      border-top: 1px solid var(--color-border);
      background-color: var(--color-surface-alt);
    }

    .btn {
      padding: 10px 20px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      background-color: var(--color-surface-alt);
      color: var(--color-text);
    }

    .btn-secondary:hover:not(:disabled) {
      background-color: var(--color-border);
    }

    .btn-primary {
      background-color: var(--color-primary);
      color: #fff;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #1d4ed8;
    }

    @media (max-width: 640px) {
      .modal-content {
        width: 95%;
        margin: 10px;
      }

      .modal-header,
      .modal-body,
      .modal-footer {
        padding: 16px;
      }
    }
  `]
})
export class ChangePasswordDialogComponent implements AfterViewInit {
  private authService = inject(AuthService);
  @ViewChild('dialogContainer') private dialogRef?: ElementRef<HTMLDivElement>;
  @ViewChild('firstField') private firstField?: ElementRef<HTMLInputElement>;

  private readonly focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  private focusableElements: HTMLElement[] = [];

  readonly dialogTitleId = 'changePasswordDialogTitle';
  readonly dialogDescriptionId = 'changePasswordDialogDescription';

  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  formData: ChangePasswordRequest = {
    currentPassword: '',
    newPassword: ''
  };

  confirmPassword = '';

  ngAfterViewInit(): void {
    queueMicrotask(() => this.initializeFocus());
  }

  @HostListener('document:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
      return;
    }

    if (event.key === 'Tab') {
      this.maintainFocusTrap(event);
    }
  }

  private initializeFocus(): void {
    this.refreshFocusableElements();
    if (this.firstField?.nativeElement) {
      this.firstField.nativeElement.focus();
      return;
    }

    this.focusableElements[0]?.focus();
  }

  private refreshFocusableElements(): void {
    const dialogElement = this.dialogRef?.nativeElement;
    if (!dialogElement) {
      this.focusableElements = [];
      return;
    }

    this.focusableElements = Array.from(
      dialogElement.querySelectorAll<HTMLElement>(this.focusableSelectors)
    );
  }

  private maintainFocusTrap(event: KeyboardEvent): void {
    this.refreshFocusableElements();
    if (this.focusableElements.length === 0) {
      return;
    }

    const firstElement = this.focusableElements[0];
    const lastElement = this.focusableElements[this.focusableElements.length - 1];
    const activeElement = document.activeElement as HTMLElement | null;

    if (event.shiftKey) {
      if (activeElement === firstElement || !this.focusableElements.includes(activeElement as HTMLElement)) {
        event.preventDefault();
        lastElement.focus();
      }
    } else if (activeElement === lastElement || !this.focusableElements.includes(activeElement as HTMLElement)) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  onSubmit(): void {
    if (this.formData.newPassword !== this.confirmPassword) {
      this.errorMessage.set('Las contraseñas no coinciden');
      return;
    }

    if (this.formData.newPassword.length < 6) {
      this.errorMessage.set('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.authService.changePassword(this.formData).subscribe({
      next: (response) => {
        this.successMessage.set('Contraseña cambiada exitosamente');
        this.isLoading.set(false);
        
        // Limpiar formulario
        this.formData = { currentPassword: '', newPassword: '' };
        this.confirmPassword = '';

        // Cerrar después de 1.5 segundos
        setTimeout(() => {
          this.close();
        }, 1500);
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Error al cambiar la contraseña');
        this.isLoading.set(false);
      }
    });
  }

  close(): void {
    // Emit close event to parent
    const closeEvent = new CustomEvent('closeDialog');
    window.dispatchEvent(closeEvent);
  }
}
