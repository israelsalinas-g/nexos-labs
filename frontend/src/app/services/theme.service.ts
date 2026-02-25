import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'lis-theme-preference';
  private readonly themeSignal = signal<ThemeMode>('light');

  readonly theme = this.themeSignal.asReadonly();

  constructor(@Inject(DOCUMENT) private document: Document) {
    const stored = this.getStoredTheme();
    this.applyTheme(stored, false);

    if (typeof window !== 'undefined' && window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        const hasStoredPreference = this.hasStoredPreference();
        if (!hasStoredPreference) {
          this.applyTheme(event.matches ? 'dark' : 'light', false);
        }
      });
    }
  }

  setTheme(theme: ThemeMode): void {
    this.applyTheme(theme);
  }

  toggleTheme(): void {
    const nextTheme: ThemeMode = this.themeSignal() === 'dark' ? 'light' : 'dark';
    this.applyTheme(nextTheme);
  }

  private getStoredTheme(): ThemeMode {
    if (typeof window === 'undefined') {
      return 'light';
    }

    const stored = localStorage.getItem(this.storageKey) as ThemeMode | null;
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }

    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  private hasStoredPreference(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    return localStorage.getItem(this.storageKey) !== null;
  }

  private applyTheme(theme: ThemeMode, persist = true): void {
    this.themeSignal.set(theme);
    this.document.documentElement.setAttribute('data-theme', theme);

    if (persist && typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, theme);
    }
  }
}
