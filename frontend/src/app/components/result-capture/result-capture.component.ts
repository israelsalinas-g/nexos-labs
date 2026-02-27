import {
  Component, inject, signal, computed, OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LaboratoryOrderService } from '../../services/laboratory-order.service';
import { UnifiedTestResultService } from '../../services/unified-test-result.service';
import { UnifiedTestResult, CreateUnifiedTestResultDto } from '../../models/unified-test-result.interface';
import { TestResponseOption } from '../../models/test-response-type.interface';

interface CaptureItem {
  orderTestId: number;
  testDefinitionId: number;
  sampleNumber: string | null;
  testDefinition: any;              // includes responseType + options
  result: UnifiedTestResult | null; // already-saved result
  inputType: 'numeric' | 'text' | 'enum';
  draftValue: string | number | null;
  draftOptionId: number | null;
  saving: boolean;
  saved: boolean;
  error: string | null;
}

@Component({
  selector: 'app-result-capture',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './result-capture.component.html',
  styleUrls: ['./result-capture.component.css'],
})
export class ResultCaptureComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(LaboratoryOrderService);
  private resultService = inject(UnifiedTestResultService);

  orderId     = signal<string | null>(null);
  captureData = signal<any>(null);   // full pending-capture response
  items       = signal<CaptureItem[]>([]);
  loading     = signal(true);
  error       = signal<string | null>(null);

  // Extraídos directamente del backend — sin cálculos en frontend
  patientGender    = computed<'M' | 'F' | undefined>(() => {
    const g = this.captureData()?.patientGender;
    return g === 'M' || g === 'F' ? g : undefined;
  });
  patientAgeMonths = computed<number | undefined>(() => this.captureData()?.patientAgeMonths);

  pendingCount = computed(() => this.items().filter(i => !i.saved && !i.result).length);
  savedCount   = computed(() => this.items().filter(i =>  i.saved ||  !!i.result).length);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.orderId.set(params['id']);
      this.loadCapture();
    });
  }

  loadCapture(): void {
    const id = this.orderId();
    if (!id) return;

    this.loading.set(true);
    this.error.set(null);

    // Un solo endpoint devuelve: orden, tests con responseType+options, resultados previos
    this.orderService.getPendingCapture(id).subscribe({
      next: (data: any) => {
        this.captureData.set(data);
        this.items.set(this.buildItems(data.tests ?? []));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar la orden. Intente de nuevo.');
        this.loading.set(false);
      },
    });
  }

  private buildItems(tests: any[]): CaptureItem[] {
    return tests.map(t => {
      const rt = t.testDefinition?.responseType;
      let inputType: 'numeric' | 'text' | 'enum' = 'text';
      if (rt?.inputType === 'numeric') inputType = 'numeric';
      else if (rt?.inputType === 'enum') inputType = 'enum';

      const existing: UnifiedTestResult | null = t.existingResult ?? null;
      return {
        orderTestId: t.orderTestId,
        testDefinitionId: t.testDefinitionId,
        sampleNumber: t.sampleNumber ?? null,
        testDefinition: t.testDefinition ?? null,
        result: existing,
        inputType,
        draftValue: existing?.numericValue ?? existing?.textValue ?? null,
        draftOptionId: existing?.responseOptionId ?? null,
        saving: false,
        saved: !!existing,
        error: null,
      };
    });
  }

  saveResult(item: CaptureItem): void {
    const td = item.testDefinition;
    if (!td) return;

    const dto: CreateUnifiedTestResultDto = {
      orderTestId: item.orderTestId,
      testDefinitionId: item.testDefinitionId,
    };

    if (item.inputType === 'numeric' && item.draftValue !== null && item.draftValue !== '') {
      dto.numericValue = Number(item.draftValue);
    } else if (item.inputType === 'enum' && item.draftOptionId !== null) {
      dto.responseOptionId = item.draftOptionId;
    } else if (item.inputType === 'text' && item.draftValue !== null && item.draftValue !== '') {
      dto.textValue = String(item.draftValue);
    } else {
      item.error = 'Debe ingresar un valor para guardar';
      this.refreshItem(item);
      return;
    }

    item.saving = true;
    item.error = null;
    this.refreshItem(item);

    this.resultService.upsert(dto, this.patientGender(), this.patientAgeMonths()).subscribe({
      next: result => {
        item.result = result;
        item.saved = true;
        item.saving = false;
        this.refreshItem(item);
      },
      error: () => {
        item.saving = false;
        item.error = 'Error al guardar. Intente de nuevo.';
        this.refreshItem(item);
      },
    });
  }

  private refreshItem(item: CaptureItem): void {
    this.items.set(this.items().map(i =>
      i.orderTestId === item.orderTestId ? { ...item } : i,
    ));
  }

  onNumericInput(item: CaptureItem, value: string): void {
    item.draftValue = value;
    item.saved = false;
    this.refreshItem(item);
  }

  onTextInput(item: CaptureItem, value: string): void {
    item.draftValue = value;
    item.saved = false;
    this.refreshItem(item);
  }

  onOptionSelect(item: CaptureItem, optionId: string): void {
    item.draftOptionId = optionId ? Number(optionId) : null;
    item.saved = false;
    this.refreshItem(item);
  }

  getOptions(item: CaptureItem): TestResponseOption[] {
    return item.testDefinition?.responseType?.options ?? [];
  }

  getUnit(item: CaptureItem): string {
    return item.testDefinition?.unit ?? '';
  }

  isAbnormal(item: CaptureItem): boolean | null {
    return item.result?.isAbnormal ?? null;
  }

  goBack(): void {
    this.router.navigate(['/laboratory-orders', this.orderId()]);
  }
}
