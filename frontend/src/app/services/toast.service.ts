import { Injectable, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: number;
  message: string;
  title?: string;
  type: ToastType;
  timeout: number;
  details?: string;
}

export interface ToastOptions {
  title?: string;
  timeout?: number;
  details?: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  private readonly defaultTimeout = 4500;
  private readonly toastsSignal = signal<ToastMessage[]>([]);

  readonly toasts = this.toastsSignal.asReadonly();

  show(message: string, type: ToastType = 'info', options: ToastOptions = {}): number {
    const toast: ToastMessage = {
      id: ++this.counter,
      message,
      type,
      timeout: options.timeout ?? this.defaultTimeout,
      title: options.title,
      details: options.details
    };

    this.toastsSignal.update(list => [...list, toast]);

    setTimeout(() => this.dismiss(toast.id), toast.timeout);
    return toast.id;
  }

  success(message: string, options?: ToastOptions): number {
    return this.show(message, 'success', options);
  }

  error(message: string, options?: ToastOptions): number {
    return this.show(message, 'error', options);
  }

  warning(message: string, options?: ToastOptions): number {
    return this.show(message, 'warning', options);
  }

  info(message: string, options?: ToastOptions): number {
    return this.show(message, 'info', options);
  }

  dismiss(id: number): void {
    this.toastsSignal.update(list => list.filter(toast => toast.id !== id));
  }

  clear(): void {
    this.toastsSignal.set([]);
  }

  /**
   * Helper to surface common HTTP error payloads
   */
  notifyHttpError(error: unknown, fallback = 'Ocurrió un error inesperado'): void {
    if (error instanceof HttpErrorResponse) {
      const details = this.extractHttpDetails(error);
      this.error(details.message, { title: `Error ${error.status}`, details: details.details });
      return;
    }

    const message = error instanceof Error ? error.message : fallback;
    this.error(message, { title: 'Error' });
  }

  private extractHttpDetails(error: HttpErrorResponse): { message: string; details?: string } {
    if (typeof error.error === 'string') {
      return { message: error.error };
    }

    if (error.error?.message) {
      const details = Array.isArray(error.error?.errors)
        ? error.error.errors.join('\n')
        : error.error?.errors
          ? JSON.stringify(error.error.errors)
          : undefined;

      return { message: error.error.message, details };
    }

    return {
      message: error.message || 'Error en la solicitud',
      details: JSON.stringify(error.error)
    };
  }
}
