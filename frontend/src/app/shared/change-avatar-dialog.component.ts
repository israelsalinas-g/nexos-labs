import { AfterViewInit, Component, ElementRef, HostListener, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-change-avatar-dialog',
  standalone: true,
  imports: [CommonModule],
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
          <h2 [id]="dialogTitleId">Cambiar Avatar</h2>
          <button class="close-btn" (click)="close()" type="button" aria-label="Cerrar diálogo">
            <span>×</span>
          </button>
        </div>

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

          <div class="avatar-preview">
            @if (selectedAvatar()) {
              <img [src]="selectedAvatar()" alt="Avatar seleccionado" class="preview-img" />
            } @else if (currentAvatar()) {
              <img [src]="currentAvatar()" alt="Avatar actual" class="preview-img" />
            } @else {
              <div class="preview-placeholder">
                <span class="placeholder-icon">👤</span>
              </div>
            }
          </div>

          @if (isLoadingAvatars()) {
            <div class="loading-container" role="status" aria-live="polite">
              <div class="spinner" aria-hidden="true"></div>
              <p>Cargando avatares disponibles...</p>
            </div>
          } @else if (availableAvatars().length > 0) {
            <div class="avatars-section">
              <p class="section-title">Selecciona un avatar:</p>
              <div class="avatars-grid" role="radiogroup" aria-label="Selecciona un avatar">
                @for (avatar of availableAvatars(); track avatar; let i = $index) {
                  <button 
                    type="button"
                    class="avatar-option"
                    [class.selected]="selectedAvatar() === avatar"
                    [class.current]="currentAvatar() === avatar"
                    (click)="selectAvatar(avatar)"
                    (keydown.enter)="selectAvatar(avatar)"
                    (keydown.space)="selectAvatar(avatar); $event.preventDefault()"
                    role="radio"
                    [attr.aria-checked]="selectedAvatar() === avatar"
                    [attr.aria-label]="'Avatar ' + (i + 1)"
                  >
                    <img [src]="avatar" [alt]="'Avatar ' + (i + 1)" class="avatar-img" />
                    @if (currentAvatar() === avatar) {
                      <span class="current-badge">Actual</span>
                    }
                    @if (selectedAvatar() === avatar) {
                      <div class="selected-overlay">
                        <span class="check-icon">✓</span>
                      </div>
                    }
                  </button>
                }
              </div>
            </div>
          } @else {
            <div class="empty-state">
              <span class="empty-icon">📷</span>
              <p>No hay avatares disponibles</p>
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
            type="button"
            class="btn btn-primary"
            (click)="onSubmit()"
            [disabled]="isLoading() || !selectedAvatar() || selectedAvatar() === currentAvatar()"
          >
            @if (isLoading()) {
              <span>Guardando...</span>
            } @else {
              <span>Guardar Avatar</span>
            }
          </button>
        </div>
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
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-content {
      background: var(--color-surface);
      border-radius: 12px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 40px var(--color-shadow);
      border: 1px solid var(--color-border);
      color: var(--color-text);
      animation: slideUp 0.3s ease;
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
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
    }

    .modal-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: white;
    }

    .close-btn {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      font-size: 32px;
      color: white;
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
      background-color: rgba(255, 255, 255, 0.3);
    }

    .modal-body {
      padding: 24px;
      background-color: var(--color-surface);
      color: var(--color-text);
    }

    .avatar-preview {
      width: 120px;
      height: 120px;
      margin: 0 auto 24px;
      border-radius: 50%;
      overflow: hidden;
      border: 4px solid var(--color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--color-surface-alt);
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
    }

    .preview-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .preview-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
    }

    .placeholder-icon {
      font-size: 50px;
      opacity: 0.8;
    }

    .loading-container {
      text-align: center;
      padding: 40px 20px;
    }

    .spinner {
      width: 40px;
      height: 40px;
      margin: 0 auto 16px;
      border: 4px solid #f3f4f6;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading-container p {
      color: var(--color-text-muted);
      font-size: 14px;
    }

    .avatars-section {
      margin-top: 20px;
    }

    .section-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text);
      margin-bottom: 16px;
      text-align: center;
    }

    .avatars-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 12px;
      max-height: 300px;
      overflow-y: auto;
      padding: 8px;
      border-radius: 12px;
      border: 1px solid var(--color-border);
      background-color: var(--color-surface-alt);
    }

    .avatars-grid::-webkit-scrollbar {
      width: 8px;
    }

    .avatars-grid::-webkit-scrollbar-track {
      background: var(--color-surface);
      border-radius: 4px;
    }

    .avatars-grid::-webkit-scrollbar-thumb {
      background: var(--color-border);
      border-radius: 4px;
    }

    .avatars-grid::-webkit-scrollbar-thumb:hover {
      background: var(--color-primary);
    }

    .avatar-option {
      position: relative;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      overflow: hidden;
      cursor: pointer;
      border: 3px solid transparent;
      transition: all 0.2s;
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.15);
      background-color: var(--color-surface);
    }

    .avatar-option:hover:not(:disabled) {
      transform: scale(1.05);
      border-color: var(--color-primary);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }

    .avatar-option.selected {
      border-color: var(--color-primary);
      box-shadow: 0 4px 16px rgba(37, 99, 235, 0.45);
    }

    .avatar-option.current {
      border-color: var(--color-success);
    }

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .current-badge {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to top, rgba(16, 185, 129, 0.95), rgba(16, 185, 129, 0));
      color: white;
      font-size: 10px;
      font-weight: 600;
      text-align: center;
      padding: 4px 2px;
    }

    .selected-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(37, 99, 235, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.2s ease;
    }

    .check-icon {
      font-size: 32px;
      color: white;
      font-weight: bold;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
    }

    .empty-icon {
      font-size: 60px;
      opacity: 0.3;
      display: block;
      margin-bottom: 16px;
    }

    .empty-state p {
      color: var(--color-text-muted);
      font-size: 14px;
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
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      transform: translateY(-1px);
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

      .avatar-preview {
        width: 100px;
        height: 100px;
      }

      .avatars-grid {
        grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
        gap: 10px;
      }

      .avatar-option {
        width: 70px;
        height: 70px;
      }
    }
  `]
})
export class ChangeAvatarDialogComponent implements OnInit, AfterViewInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  @ViewChild('dialogContainer') private dialogRef?: ElementRef<HTMLDivElement>;

  private readonly focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  private focusableElements: HTMLElement[] = [];

  readonly dialogTitleId = 'changeAvatarDialogTitle';
  readonly dialogDescriptionId = 'changeAvatarDialogDescription';

  isLoading = signal(false);
  isLoadingAvatars = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  selectedAvatar = signal('');
  currentAvatar = signal('');
  availableAvatars = signal<string[]>([]);

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

  ngOnInit(): void {
    // Obtener avatar actual del usuario
    const user = this.authService.getCurrentUserValue();
    if (user?.avatar) {
      this.currentAvatar.set(user.avatar);
    }

    // Cargar avatares disponibles desde el backend
    this.loadAvailableAvatars();
  }

  private initializeFocus(): void {
    this.refreshFocusableElements();
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

  /**
   * Cargar avatares disponibles desde el backend
   */
  private loadAvailableAvatars(): void {
    this.isLoadingAvatars.set(true);
    this.errorMessage.set('');

    this.userService.getAvailableAvatars().subscribe({
      next: (avatars) => {
        this.availableAvatars.set(avatars);
        this.isLoadingAvatars.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Error al cargar los avatares disponibles');
        this.isLoadingAvatars.set(false);
        console.error('Error loading avatars:', error);
      }
    });
  }

  /**
   * Seleccionar un avatar de la galería
   */
  selectAvatar(avatar: string): void {
    this.selectedAvatar.set(avatar);
    this.errorMessage.set('');
  }

  /**
   * Guardar el avatar seleccionado
   */
  onSubmit(): void {
    const user = this.authService.getCurrentUserValue();
    if (!user) {
      this.errorMessage.set('Usuario no autenticado');
      return;
    }

    if (!this.selectedAvatar()) {
      this.errorMessage.set('Por favor selecciona un avatar');
      return;
    }

    if (this.selectedAvatar() === this.currentAvatar()) {
      this.errorMessage.set('Este ya es tu avatar actual');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.userService.changeAvatar(user.id, { avatar: this.selectedAvatar() }).subscribe({
      next: (response) => {
        this.successMessage.set('Avatar actualizado exitosamente');
        this.isLoading.set(false);

        // Actualizar el usuario en el localStorage
        const currentUser = this.authService.getCurrentUserValue();
        if (currentUser) {
          const updatedUser = { ...currentUser, avatar: response.avatar };
          localStorage.setItem('current_user', JSON.stringify(updatedUser));
          
          // Emitir evento para actualizar el header
          window.dispatchEvent(new CustomEvent('avatarUpdated', { 
            detail: { avatar: response.avatar } 
          }));
        }

        // Cerrar después de 1 segundo
        setTimeout(() => {
          this.close();
        }, 1000);
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Error al actualizar el avatar');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Cerrar el diálogo
   */
  close(): void {
    const closeEvent = new CustomEvent('closeDialog');
    window.dispatchEvent(closeEvent);
  }
}
