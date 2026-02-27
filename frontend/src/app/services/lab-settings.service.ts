import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of, tap } from 'rxjs';
import { BaseService } from './base.service';

export interface LabSetting {
  id: number;
  key: string;
  value: string | null;
  label: string | null;
  type: string;    // 'text' | 'textarea' | 'image' | 'color'
  groupName: string | null;
  updatedAt: string;
}

export interface IntegrationStatus {
  smtp: boolean;
  twilio: boolean;
}

@Injectable({ providedIn: 'root' })
export class LabSettingsService extends BaseService {
  private readonly endpoint = `${this.baseUrl}/lab-settings`;

  /** Mapa clave→valor cacheado al iniciar la app */
  private readonly _settingsMap = signal<Record<string, string>>({});

  /** Signal de solo lectura expuesto al resto de la app */
  readonly settingsMap = this._settingsMap.asReadonly();

  /** Helper para leer un valor individual de forma reactiva */
  get = computed(() => (key: string): string => this._settingsMap()[key] ?? '');

  /** Carga los settings desde el backend y los cachea */
  loadSettings(): void {
    this.http.get<Record<string, string>>(`${this.endpoint}/map`)
      .pipe(catchError(() => of({})))
      .subscribe(map => this._settingsMap.set(map));
  }

  getAll(): Observable<LabSetting[]> {
    return this.http.get<LabSetting[]>(this.endpoint)
      .pipe(catchError(err => this.handleError(err)));
  }

  bulkUpdate(updates: { key: string; value: string }[]): Observable<LabSetting[]> {
    return this.http.put<LabSetting[]>(this.endpoint, { updates })
      .pipe(
        tap(() => this.loadSettings()),  // refresca el cache tras guardar
        catchError(err => this.handleError(err)),
      );
  }

  getIntegrationStatus(): Observable<IntegrationStatus> {
    return this.http.get<IntegrationStatus>(`${this.endpoint}/integrations`)
      .pipe(catchError(err => this.handleError(err)));
  }

  /** Valor actual de un key del mapa cacheado (llamada directa, no signal) */
  value(key: string): string {
    return this._settingsMap()[key] ?? '';
  }
}
