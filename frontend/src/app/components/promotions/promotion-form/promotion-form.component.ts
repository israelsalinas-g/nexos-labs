import {
  Component, inject, input, output, signal, computed, OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Promotion, CreatePromotionDto, UpdatePromotionDto } from '../../../models/promotion.interface';
import { TestDefinition } from '../../../models/test-definition.interface';
import { TestProfile } from '../../../models/test-profile.interface';
import { PromotionService } from '../../../services/promotion.service';
import { TestDefinitionService } from '../../../services/test-definition.service';
import { TestProfileService } from '../../../services/test-profile.service';

@Component({
  selector: 'app-promotion-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './promotion-form.component.html',
  styleUrls: ['./promotion-form.component.css'],
})
export class PromotionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private promotionService = inject(PromotionService);
  private testDefinitionService = inject(TestDefinitionService);
  private testProfileService = inject(TestProfileService);

  promotion = input<Promotion | undefined>(undefined);
  saved = output<Promotion>();
  cancelled = output<void>();

  // State signals
  loading = signal(false);
  error = signal<string | null>(null);
  allTests = signal<TestDefinition[]>([]);
  allProfiles = signal<TestProfile[]>([]);
  selectedTestIds = signal<Set<string>>(new Set());
  selectedProfileIds = signal<Set<string>>(new Set());
  testSearch = signal('');
  profileSearch = signal('');

  form!: FormGroup;

  get isEditMode(): boolean { return !!this.promotion(); }

  filteredTests = computed(() => {
    const q = this.testSearch().toLowerCase();
    return this.allTests().filter(t =>
      t.name.toLowerCase().includes(q) || (t.code ?? '').toLowerCase().includes(q),
    );
  });

  filteredProfiles = computed(() => {
    const q = this.profileSearch().toLowerCase();
    return this.allProfiles().filter(p =>
      p.name.toLowerCase().includes(q) || (p.code ?? '').toLowerCase().includes(q),
    );
  });

  // Compute total value of individual items (sum of prices)
  totalIndividualValue = computed(() => {
    const testTotal = this.allTests()
      .filter(t => this.selectedTestIds().has(t.id))
      .reduce((sum, t) => sum + (parseFloat(t.price as any) || 0), 0);
    const profileTotal = this.allProfiles()
      .filter(p => this.selectedProfileIds().has(p.id))
      .reduce((sum, p) => sum + (parseFloat(p.price as any) || 0), 0);
    return testTotal + profileTotal;
  });

  ngOnInit(): void {
    this.buildForm();
    this.loadCatalog();

    const promo = this.promotion();
    if (promo) {
      this.selectedTestIds.set(new Set(promo.tests?.map(t => t.id) ?? []));
      this.selectedProfileIds.set(new Set(promo.profiles?.map(p => p.id) ?? []));
    }
  }

  private buildForm(): void {
    const promo = this.promotion();
    this.form = this.fb.group({
      name: [promo?.name ?? '', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
      description: [promo?.description ?? ''],
      price: [promo ? parseFloat(promo.price) : 0, [Validators.required, Validators.min(0)]],
      validFrom: [promo?.validFrom ?? '', Validators.required],
      validTo: [promo?.validTo ?? '', Validators.required],
      isActive: [promo?.isActive ?? true],
    }, { validators: this.dateRangeValidator });
  }

  private dateRangeValidator(group: FormGroup) {
    const from = group.get('validFrom')?.value;
    const to = group.get('validTo')?.value;
    if (from && to && to <= from) {
      return { dateRange: true };
    }
    return null;
  }

  private loadCatalog(): void {
    // Load all active tests (limit high to get all)
    this.testDefinitionService.getTestDefinitions({ limit: 999 }).subscribe({
      next: r => this.allTests.set(r.data),
      error: () => {},
    });
    // Load all active profiles
    this.testProfileService.getTestProfiles({ limit: 999 }).subscribe({
      next: r => this.allProfiles.set(r.data),
      error: () => {},
    });
  }

  isTestSelected(id: string): boolean { return this.selectedTestIds().has(id); }
  isProfileSelected(id: string): boolean { return this.selectedProfileIds().has(id); }

  toggleTest(id: string): void {
    const s = new Set(this.selectedTestIds());
    s.has(id) ? s.delete(id) : s.add(id);
    this.selectedTestIds.set(s);
  }

  toggleProfile(id: string): void {
    const s = new Set(this.selectedProfileIds());
    s.has(id) ? s.delete(id) : s.add(id);
    this.selectedProfileIds.set(s);
  }

  onTestSearch(event: Event): void {
    this.testSearch.set((event.target as HTMLInputElement).value);
  }

  onProfileSearch(event: Event): void {
    this.profileSearch.set((event.target as HTMLInputElement).value);
  }

  isFieldInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    const v = this.form.value;
    const payload: CreatePromotionDto = {
      name: v.name,
      description: v.description || undefined,
      price: v.price,
      validFrom: v.validFrom,
      validTo: v.validTo,
      isActive: v.isActive,
      testIds: [...this.selectedTestIds()],
      profileIds: [...this.selectedProfileIds()],
    };

    const promo = this.promotion();
    const request = promo
      ? this.promotionService.update(promo.id, payload as UpdatePromotionDto)
      : this.promotionService.create(payload);

    request.subscribe({
      next: result => {
        this.loading.set(false);
        this.saved.emit(result);
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.error.set(err.message);
      },
    });
  }

  onCancel(): void { this.cancelled.emit(); }
}
