import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TestDefinition, CreateTestDefinitionDto, UpdateTestDefinitionDto } from '../../../models/test-definition.interface';
import { TestDefinitionService } from '../../../services/test-definition.service';
import { TestSection } from '../../../models/test-section.interface';
import { TestResultType, TEST_RESULT_TYPE_LABELS } from '../../../enums/test-result-type.enums';
import { TestResponseType } from '../../../models/test-response-type.interface';
import { TestResponseTypeService } from '../../../services/test-response-type.service';
import { TestReferenceRange, CreateTestReferenceRangeDto, RangeGender } from '../../../models/test-reference-range.interface';
import { TestReferenceRangeService } from '../../../services/test-reference-range.service';

@Component({
  selector: 'app-test-definition-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './test-definition-form.component.html',
  styleUrls: ['./test-definition-form.component.css']
})
export class TestDefinitionFormComponent implements OnInit, OnChanges {
  @Input() testDefinition?: TestDefinition;
  @Input() categories: TestSection[] = [];
  @Output() saved = new EventEmitter<TestDefinition>();
  @Output() cancelled = new EventEmitter<void>();

  testForm!: FormGroup;
  rangeForm!: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  submitError: string | null = null;
  submitSuccess: string | null = null;
  activeTab: 'info' | 'ranges' = 'info';

  // Tipos de respuesta dinámicos (nuevo sistema)
  activeResponseTypes: TestResponseType[] = [];
  loadingResponseTypes = false;

  // Rangos de referencia
  referenceRanges: TestReferenceRange[] = [];
  loadingRanges = false;
  rangeError: string | null = null;
  showRangeForm = false;
  isSubmittingRange = false;

  // Fallback con enum estático (compatibilidad)
  testResultTypes = [
    { value: TestResultType.NUMERIC, label: TEST_RESULT_TYPE_LABELS[TestResultType.NUMERIC] },
    { value: TestResultType.TEXT, label: TEST_RESULT_TYPE_LABELS[TestResultType.TEXT] },
    { value: TestResultType.POSITIVE_NEGATIVE, label: TEST_RESULT_TYPE_LABELS[TestResultType.POSITIVE_NEGATIVE] },
    { value: TestResultType.POSITIVE_NEGATIVE_3PLUS, label: TEST_RESULT_TYPE_LABELS[TestResultType.POSITIVE_NEGATIVE_3PLUS] },
    { value: TestResultType.POSITIVE_NEGATIVE_4PLUS, label: TEST_RESULT_TYPE_LABELS[TestResultType.POSITIVE_NEGATIVE_4PLUS] },
    { value: TestResultType.ESCASA_MODERADA_ABUNDANTE, label: TEST_RESULT_TYPE_LABELS[TestResultType.ESCASA_MODERADA_ABUNDANTE] },
    { value: TestResultType.ESCASA_MODERADA_ABUNDANTE_AUSENTE, label: TEST_RESULT_TYPE_LABELS[TestResultType.ESCASA_MODERADA_ABUNDANTE_AUSENTE] },
    { value: TestResultType.REACTIVE_NON_REACTIVE, label: TEST_RESULT_TYPE_LABELS[TestResultType.REACTIVE_NON_REACTIVE] },
    { value: TestResultType.DETECTED_NOT_DETECTED, label: TEST_RESULT_TYPE_LABELS[TestResultType.DETECTED_NOT_DETECTED] }
  ];

  genderOptions: { value: RangeGender; label: string }[] = [
    { value: 'ANY', label: 'Cualquier sexo' },
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' },
  ];

  constructor(
    private fb: FormBuilder,
    private testService: TestDefinitionService,
    private responseTypeService: TestResponseTypeService,
    private referenceRangeService: TestReferenceRangeService,
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.testDefinition;
    this.initForm();
    this.loadResponseTypes();
    if (this.isEditMode && this.testDefinition?.id) {
      this.loadReferenceRanges();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['testDefinition'] && !changes['testDefinition'].firstChange) {
      this.isEditMode = !!this.testDefinition;
      this.initForm();
      this.submitError = null;
      this.submitSuccess = null;
      this.activeTab = 'info';
      if (this.isEditMode && this.testDefinition?.id) {
        this.loadReferenceRanges();
      }
    }
  }

  private loadResponseTypes(): void {
    this.loadingResponseTypes = true;
    this.responseTypeService.getAllActive().subscribe({
      next: (types) => {
        this.activeResponseTypes = types;
        this.loadingResponseTypes = false;
      },
      error: () => {
        this.loadingResponseTypes = false;
        // Si falla, el formulario fallback con enum estático sigue disponible
      }
    });
  }

  loadReferenceRanges(): void {
    if (!this.testDefinition?.id) return;
    this.loadingRanges = true;
    this.referenceRangeService.getByTestDefinition(this.testDefinition.id).subscribe({
      next: (ranges) => {
        this.referenceRanges = ranges;
        this.loadingRanges = false;
      },
      error: (err) => {
        this.rangeError = err.message;
        this.loadingRanges = false;
      }
    });
  }

  initForm(): void {
    this.testForm = this.fb.group({
      sectionId: [
        this.testDefinition?.sectionId || '',
        [Validators.required]
      ],
      name: [
        this.testDefinition?.name || '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(150)]
      ],
      code: [
        this.testDefinition?.code || '',
        [Validators.maxLength(20)]
      ],
      description: [this.testDefinition?.description || ''],
      responseTypeId: [
        this.testDefinition?.responseType?.id ?? null,
      ],
      resultType: [
        this.getResultTypeForForm(),
        [Validators.required]
      ],
      unit: [
        this.testDefinition?.unit || '',
        [Validators.maxLength(50)]
      ],
      referenceRange: [this.testDefinition?.referenceRange || ''],
      method: [
        this.testDefinition?.method || '',
        [Validators.maxLength(100)]
      ],
      sampleType: [
        this.testDefinition?.sampleType || '',
        [Validators.maxLength(50)]
      ],
      processingTime: [
        this.testDefinition?.processingTime || 0,
        [Validators.min(0)]
      ],
      price: [
        this.testDefinition?.price || '',
        [Validators.min(0)]
      ],
      displayOrder: [this.testDefinition?.displayOrder || 0],
      isActive: [this.testDefinition?.isActive !== undefined ? this.testDefinition.isActive : true]
    });

    // Al cambiar responseTypeId, sincronizar resultType con el slug para compatibilidad
    this.testForm.get('responseTypeId')?.valueChanges.subscribe((id) => {
      if (id) {
        const selected = this.activeResponseTypes.find(t => t.id === parseInt(id));
        if (selected) {
          this.testForm.get('resultType')?.setValue(selected.slug, { emitEvent: false });
        }
      }
    });
  }

  initRangeForm(): void {
    this.rangeForm = this.fb.group({
      gender: ['ANY', Validators.required],
      ageMinMonths: [0, [Validators.min(0)]],
      ageMaxMonths: [null],
      minValue: [null],
      maxValue: [null],
      textualRange: [''],
      interpretation: ['Normal'],
      unit: [this.testDefinition?.unit || ''],
    });
  }

  getResultTypeForForm(): string {
    if (!this.testDefinition?.resultType) return '';
    return this.testDefinition.resultType as string;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.testForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getSelectedResponseType(): TestResponseType | undefined {
    const id = this.testForm.get('responseTypeId')?.value;
    return id ? this.activeResponseTypes.find(t => t.id === parseInt(id)) : undefined;
  }

  // --- Reference Ranges ---
  openRangeForm(): void {
    this.initRangeForm();
    this.showRangeForm = true;
    this.rangeError = null;
  }

  cancelRangeForm(): void {
    this.showRangeForm = false;
  }

  submitRange(): void {
    if (!this.testDefinition?.id) return;
    this.isSubmittingRange = true;
    const v = this.rangeForm.value;
    const dto: CreateTestReferenceRangeDto = {
      testDefinitionId: this.testDefinition.id,
      gender: v.gender,
      ageMinMonths: v.ageMinMonths ?? 0,
      ageMaxMonths: v.ageMaxMonths ?? undefined,
      minValue: v.minValue ?? undefined,
      maxValue: v.maxValue ?? undefined,
      textualRange: v.textualRange || undefined,
      interpretation: v.interpretation || undefined,
      unit: v.unit || undefined,
    };
    this.referenceRangeService.create(dto).subscribe({
      next: () => {
        this.showRangeForm = false;
        this.isSubmittingRange = false;
        this.loadReferenceRanges();
      },
      error: (err) => {
        this.rangeError = err.message;
        this.isSubmittingRange = false;
      }
    });
  }

  deleteRange(range: TestReferenceRange): void {
    if (confirm(`¿Eliminar rango ${range.gender} - ${range.ageMinMonths}-${range.ageMaxMonths ?? '∞'} meses?`)) {
      this.referenceRangeService.delete(range.id).subscribe({
        next: () => this.loadReferenceRanges(),
        error: (err) => { this.rangeError = err.message; }
      });
    }
  }

  getGenderLabel(gender: string): string {
    return this.genderOptions.find(g => g.value === gender)?.label ?? gender;
  }

  formatAge(months: number | undefined): string {
    if (months === undefined || months === null) return '∞';
    const y = Math.floor(months / 12);
    const m = months % 12;
    return y > 0 ? `${y}a ${m > 0 ? m + 'm' : ''}`.trim() : `${m}m`;
  }

  // --- Submit principal ---
  onSubmit(): void {
    if (this.testForm.invalid) {
      Object.keys(this.testForm.controls).forEach(key => {
        this.testForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;
    this.submitSuccess = null;

    const formValue = this.testForm.value;
    const priceValue = formValue.price !== null && formValue.price !== undefined && formValue.price !== ''
      ? parseFloat(formValue.price)
      : undefined;

    const responseTypeId = formValue.responseTypeId ? parseInt(formValue.responseTypeId) : undefined;

    if (this.isEditMode && this.testDefinition) {
      const updateData: UpdateTestDefinitionDto = {
        sectionId: formValue.sectionId,
        name: formValue.name,
        code: formValue.code || undefined,
        description: formValue.description || undefined,
        resultType: formValue.resultType,
        responseTypeId,
        unit: formValue.unit || undefined,
        method: formValue.method || undefined,
        sampleType: formValue.sampleType || undefined,
        processingTime: formValue.processingTime !== null && formValue.processingTime !== undefined ? formValue.processingTime : undefined,
        price: priceValue,
        displayOrder: formValue.displayOrder,
        isActive: formValue.isActive
      };

      this.testService.updateTestDefinition(this.testDefinition.id.toString(), updateData)
        .subscribe({
          next: (updatedTest) => {
            this.submitSuccess = 'Prueba actualizada exitosamente';
            setTimeout(() => { this.saved.emit(updatedTest); }, 1000);
          },
          error: (err) => {
            this.submitError = err.message || 'Error al actualizar la prueba';
            this.isSubmitting = false;
          }
        });
    } else {
      const createData: CreateTestDefinitionDto = {
        sectionId: formValue.sectionId,
        name: formValue.name,
        code: formValue.code || undefined,
        description: formValue.description || undefined,
        resultType: formValue.resultType,
        responseTypeId,
        unit: formValue.unit || undefined,
        method: formValue.method || undefined,
        sampleType: formValue.sampleType || undefined,
        processingTime: formValue.processingTime !== null && formValue.processingTime !== undefined ? formValue.processingTime : undefined,
        price: priceValue,
        displayOrder: formValue.displayOrder,
        isActive: formValue.isActive
      };

      this.testService.createTestDefinition(createData)
        .subscribe({
          next: (newTest) => {
            this.submitSuccess = 'Prueba creada exitosamente';
            setTimeout(() => { this.saved.emit(newTest); }, 1000);
          },
          error: (err) => {
            this.submitError = err.message || 'Error al crear la prueba';
            this.isSubmitting = false;
          }
        });
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
