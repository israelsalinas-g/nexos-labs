import {
  Component, OnInit, signal, computed, ChangeDetectionStrategy, inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LabSettingsService, LabSetting, IntegrationStatus } from '../../../services/lab-settings.service';

interface SettingField extends LabSetting {
  currentValue: string;
  isDirty: boolean;
}

@Component({
  selector: 'app-lab-settings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './lab-settings.component.html',
  styleUrls: ['./lab-settings.component.css'],
})
export class LabSettingsComponent implements OnInit {
  private readonly svc = inject(LabSettingsService);

  settings = signal<SettingField[]>([]);
  loading = signal(false);
  saving = signal(false);
  saved = signal(false);
  error = signal<string | null>(null);
  integrations = signal<IntegrationStatus | null>(null);
  logoPreview = signal<string | null>(null);

  readonly groups = ['general', 'contact', 'pdf'];
  readonly groupLabels: Record<string, string> = {
    general: 'General',
    contact: 'Contacto',
    pdf: 'PDF',
  };

  settingsByGroup = computed(() =>
    this.groups.reduce<Record<string, SettingField[]>>((acc, g) => {
      acc[g] = this.settings().filter(s => s.groupName === g);
      return acc;
    }, {}),
  );

  hasDirty = computed(() => this.settings().some(s => s.isDirty));

  ngOnInit(): void {
    this.loadSettings();
    this.svc.getIntegrationStatus().subscribe({
      next: status => this.integrations.set(status),
      error: () => {},
    });
  }

  private loadSettings(): void {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next: (all) => {
        const fields: SettingField[] = all.map(s => ({
          ...s,
          currentValue: s.value ?? '',
          isDirty: false,
        }));
        this.settings.set(fields);
        const logo = all.find(s => s.key === 'lab_logo_base64');
        if (logo?.value) this.logoPreview.set(logo.value);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error cargando la configuración.');
        this.loading.set(false);
      },
    });
  }

  onValueChange(setting: SettingField, value: string): void {
    this.settings.update(list =>
      list.map(s => s.key === setting.key
        ? { ...s, currentValue: value, isDirty: value !== (s.value ?? '') }
        : s,
      ),
    );
  }

  onLogoUpload(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (file.size > 200 * 1024) {
      this.error.set('El logo no puede superar 200 KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      this.logoPreview.set(base64);
      this.onValueChange(
        this.settings().find(s => s.key === 'lab_logo_base64')!,
        base64,
      );
    };
    reader.readAsDataURL(file);
  }

  removeLogo(): void {
    this.logoPreview.set(null);
    this.onValueChange(
      this.settings().find(s => s.key === 'lab_logo_base64')!,
      '',
    );
  }

  save(): void {
    if (!this.hasDirty() || this.saving()) return;
    const dirty = this.settings()
      .filter(s => s.isDirty)
      .map(s => ({ key: s.key, value: s.currentValue }));

    this.saving.set(true);
    this.error.set(null);

    this.svc.bulkUpdate(dirty).subscribe({
      next: () => {
        this.saving.set(false);
        this.saved.set(true);
        this.loadSettings();
        setTimeout(() => this.saved.set(false), 3000);
      },
      error: () => {
        this.error.set('Error guardando la configuración.');
        this.saving.set(false);
      },
    });
  }
}
