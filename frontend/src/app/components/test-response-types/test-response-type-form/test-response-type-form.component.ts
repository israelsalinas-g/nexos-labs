import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { TestResponseType, CreateTestResponseTypeDto, UpdateTestResponseTypeDto } from '../../../models/test-response-type.interface';
import { TestResponseTypeService } from '../../../services/test-response-type.service';

@Component({
  selector: 'app-test-response-type-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './test-response-type-form.component.html',
  styleUrls: ['./test-response-type-form.component.css']
})
export class TestResponseTypeFormComponent implements OnInit {
  @Input() responseType?: TestResponseType;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  form!: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  submitError: string | null = null;
  submitSuccess: string | null = null;

  constructor(
    private fb: FormBuilder,
    private service: TestResponseTypeService,
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.responseType;
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.fb.group({
      name: [this.responseType?.name ?? '', [Validators.required, Validators.maxLength(100)]],
      slug: [this.responseType?.slug ?? '', [Validators.required, Validators.maxLength(80), Validators.pattern(/^[a-z0-9_]+$/)]],
      inputType: [this.responseType?.inputType ?? 'enum', Validators.required],
      description: [this.responseType?.description ?? ''],
      options: this.fb.array(
        (this.responseType?.options ?? []).map(opt => this.buildOptionGroup(opt))
      ),
    });

    this.form.get('name')?.valueChanges.subscribe(name => {
      if (!this.isEditMode && !this.form.get('slug')?.dirty) {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
        this.form.get('slug')?.setValue(slug, { emitEvent: false });
      }
    });
  }

  private buildOptionGroup(opt?: any): FormGroup {
    return this.fb.group({
      id: [opt?.id ?? null],
      value: [opt?.value ?? '', [Validators.required, Validators.maxLength(100)]],
      label: [opt?.label ?? ''],
      displayOrder: [opt?.displayOrder ?? 0],
      color: [opt?.color ?? '#6c757d'],
      isDefault: [opt?.isDefault ?? false],
    });
  }

  get options(): FormArray {
    return this.form.get('options') as FormArray;
  }

  get showOptions(): boolean {
    return this.form.get('inputType')?.value === 'enum';
  }

  addOption(): void {
    this.options.push(this.buildOptionGroup({ displayOrder: this.options.length }));
  }

  removeOption(index: number): void {
    this.options.removeAt(index);
  }

  moveOption(index: number, direction: 'up' | 'down'): void {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= this.options.length) return;
    const current = this.options.at(index);
    const target = this.options.at(targetIndex);
    this.options.setControl(index, this.fb.group(target.value));
    this.options.setControl(targetIndex, this.fb.group(current.value));
    // Recalcular displayOrder
    this.options.controls.forEach((ctrl, i) => ctrl.get('displayOrder')?.setValue(i));
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isOptionFieldInvalid(index: number, fieldName: string): boolean {
    const field = this.options.at(index).get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;
    const value = this.form.value;

    const optionsData = this.showOptions
      ? value.options.map((opt: any, index: number) => ({
          ...(opt.id ? { id: opt.id } : {}),
          value: opt.value,
          label: opt.label || opt.value,
          displayOrder: index,
          color: opt.color,
          isDefault: opt.isDefault,
        }))
      : [];

    if (this.isEditMode && this.responseType) {
      const updateDto: UpdateTestResponseTypeDto = {
        name: value.name,
        description: value.description || undefined,
        options: optionsData,
      };
      this.service.update(this.responseType.id, updateDto).subscribe({
        next: () => {
          this.submitSuccess = 'Tipo de respuesta actualizado';
          setTimeout(() => this.saved.emit(), 800);
        },
        error: (err) => {
          this.submitError = err.message;
          this.isSubmitting = false;
        }
      });
    } else {
      const createDto: CreateTestResponseTypeDto = {
        name: value.name,
        slug: value.slug,
        inputType: value.inputType,
        description: value.description || undefined,
        options: optionsData,
      };
      this.service.create(createDto).subscribe({
        next: () => {
          this.submitSuccess = 'Tipo de respuesta creado';
          setTimeout(() => this.saved.emit(), 800);
        },
        error: (err) => {
          this.submitError = err.message;
          this.isSubmitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
