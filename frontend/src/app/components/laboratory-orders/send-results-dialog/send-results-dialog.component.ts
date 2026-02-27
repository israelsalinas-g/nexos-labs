import {
  Component, Input, Output, EventEmitter, signal, computed,
  ChangeDetectionStrategy, inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LaboratoryOrder } from '../../../models/laboratory-order.interface';
import { LaboratoryOrderService } from '../../../services/laboratory-order.service';
import { PdfUnifiedResultsService } from '../../../services/pdf/pdf-unified-results.service';
import { LabSettingsService } from '../../../services/lab-settings.service';

export interface SendResultsClosedEvent {
  refreshOrder: boolean;
}

@Component({
  selector: 'app-send-results-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './send-results-dialog.component.html',
  styleUrls: ['./send-results-dialog.component.css'],
})
export class SendResultsDialogComponent {
  private orderService = inject(LaboratoryOrderService);
  private pdfService = inject(PdfUnifiedResultsService);
  private labSettings = inject(LabSettingsService);

  @Input() order: LaboratoryOrder | null = null;
  @Input() visible = false;
  @Output() closed = new EventEmitter<SendResultsClosedEvent>();

  emailSelected = signal(true);
  whatsappSelected = signal(true);
  sending = signal(false);
  result = signal<{ emailSent: boolean; whatsappSent: boolean; errors: string[] } | null>(null);

  hasEmail = computed(() => !!this.order?.patient?.email);
  hasPhone = computed(() => !!this.order?.patient?.phone);

  patientEmail = computed(() => this.order?.patient?.email ?? '');
  patientPhone = computed(() => {
    const phone = this.order?.patient?.phone;
    return phone ? `+504 ${phone}` : '';
  });

  canSubmit = computed(() =>
    !this.sending() &&
    !this.result() &&
    ((this.emailSelected() && this.hasEmail()) || (this.whatsappSelected() && this.hasPhone()))
  );

  toggleEmail(): void { this.emailSelected.update(v => !v); }
  toggleWhatsapp(): void { this.whatsappSelected.update(v => !v); }

  async submit(): Promise<void> {
    if (!this.order?.id || !this.canSubmit()) return;

    const channels: ('email' | 'whatsapp')[] = [];
    if (this.emailSelected() && this.hasEmail()) channels.push('email');
    if (this.whatsappSelected() && this.hasPhone()) channels.push('whatsapp');
    if (channels.length === 0) return;

    this.sending.set(true);

    // Generar PDF en el frontend antes de enviar
    let pdfBase64: string | undefined;
    try {
      pdfBase64 = await this.pdfService.generateForOrder(
        this.order,
        this.labSettings.settingsMap(),
      );
    } catch (err) {
      console.warn('No se pudo generar el PDF — se enviará sin adjunto:', err);
    }

    this.orderService.sendResults(
      this.order.id,
      channels,
      pdfBase64,
      this.order.orderNumber,
    ).subscribe({
      next: (res) => {
        this.result.set(res);
        this.sending.set(false);
        // Cerramos el dialog después de un breve delay para que el usuario vea el resultado
        setTimeout(() => this.close(true), 2000);
      },
      error: (err: any) => {
        this.result.set({ emailSent: false, whatsappSent: false, errors: [err.message ?? 'Error desconocido'] });
        this.sending.set(false);
      },
    });
  }

  close(refresh = false): void {
    this.result.set(null);
    this.sending.set(false);
    this.emailSelected.set(true);
    this.whatsappSelected.set(true);
    this.closed.emit({ refreshOrder: refresh });
  }
}
