import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TestDefinition, CreateTestDefinitionDto, UpdateTestDefinitionDto } from '../../../models/test-definition.interface';
import { TestDefinitionService } from '../../../services/test-definition.service';
import { TestSection } from '../../../models/test-section.interface';
import { TestResultType, TEST_RESULT_TYPE_LABELS } from '../../../enums/test-result-type.enums';

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
  isEditMode = false;
  isSubmitting = false;
  submitError: string | null = null;
  submitSuccess: string | null = null;

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

  constructor(
    private fb: FormBuilder,
    private testService: TestDefinitionService
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.testDefinition;
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Cuando testDefinition cambia (desde undefined a un objeto), reinicializar el formulario
    if (changes['testDefinition'] && !changes['testDefinition'].firstChange) {
      console.log('ngOnChanges - testDefinition recibido:', this.testDefinition);
      console.log('sectionId value:', this.testDefinition?.sectionId);
      this.isEditMode = !!this.testDefinition;
      this.initForm();
      this.submitError = null;
      this.submitSuccess = null;
    }
  }

  initForm(): void {
    console.log('initForm - testDefinition:', this.testDefinition);
    console.log('initForm - sectionId a usar:', this.testDefinition?.sectionId || '');
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
  }

  getResultTypeForForm(): string {
    if (!this.testDefinition?.resultType) {
      return '';
    }
    // resultType ya viene como string desde el backend (ej: 'numeric', 'text', etc.)
    return this.testDefinition.resultType as string;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.testForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

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

    // DEBUG: Log all form values
    console.log('=== FORM SUBMIT DEBUG ===');
    console.log('Form Value:', formValue);
    console.log('resultType value:', formValue.resultType);
    console.log('resultType type:', typeof formValue.resultType);
    console.log('price value:', formValue.price);
    console.log('price type:', typeof formValue.price);

    // Convertir price de string a número si es necesario
    const priceValue = formValue.price !== null && formValue.price !== undefined && formValue.price !== '' 
      ? parseFloat(formValue.price) 
      : undefined;

    if (this.isEditMode && this.testDefinition) {
      const updateData: UpdateTestDefinitionDto = {
        sectionId: formValue.sectionId,
        name: formValue.name,
        code: formValue.code || undefined,
        description: formValue.description || undefined,
        resultType: formValue.resultType,
        unit: formValue.unit || undefined,
        method: formValue.method || undefined,
        sampleType: formValue.sampleType || undefined,
        processingTime: formValue.processingTime !== null && formValue.processingTime !== undefined ? formValue.processingTime : undefined,
        price: priceValue,
        displayOrder: formValue.displayOrder,
        isActive: formValue.isActive
      };

      console.log('Update Data to send:', updateData);

      this.testService.updateTestDefinition(this.testDefinition.id.toString(), updateData)
        .subscribe({
          next: (updatedTest) => {
            this.submitSuccess = 'Prueba actualizada exitosamente';
            setTimeout(() => {
              this.saved.emit(updatedTest);
            }, 1000);
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
        unit: formValue.unit || undefined,
        method: formValue.method || undefined,
        sampleType: formValue.sampleType || undefined,
        processingTime: formValue.processingTime !== null && formValue.processingTime !== undefined ? formValue.processingTime : undefined,
        price: priceValue,
        displayOrder: formValue.displayOrder,
        isActive: formValue.isActive
      };

      console.log('Create Data to send:', createData);

      this.testService.createTestDefinition(createData)
        .subscribe({
          next: (newTest) => {
            this.submitSuccess = 'Prueba creada exitosamente';
            setTimeout(() => {
              this.saved.emit(newTest);
            }, 1000);
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
