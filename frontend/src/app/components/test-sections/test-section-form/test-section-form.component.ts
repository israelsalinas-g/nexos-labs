import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TestSection, CreateTestSectionDto, UpdateTestSectionDto } from '../../../models/test-section.interface';
import { TestSectionService } from '../../../services/test-section.service';

@Component({
  selector: 'app-test-section-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './test-section-form.component.html',
  styleUrls: ['./test-section-form.component.css']
})
export class TestSectionFormComponent implements OnInit {
  @Input() section?: TestSection;
  @Output() saved = new EventEmitter<TestSection>();
  @Output() cancelled = new EventEmitter<void>();

  sectionForm!: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  submitError: string | null = null;
  submitSuccess: string | null = null;

  constructor(
    private fb: FormBuilder,
    private sectionService: TestSectionService
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.section;
    this.initForm();
  }

  initForm(): void {
    this.sectionForm = this.fb.group({
      name: [
        this.section?.name || '', 
        [Validators.required, Validators.minLength(2), Validators.maxLength(100)]
      ],
      code: [
        this.section?.code || '', 
        [Validators.maxLength(20)]
      ],
      description: [this.section?.description || ''],
      color: [
        this.section?.color || '#4CAF50', 
        [Validators.pattern(/^#[0-9A-Fa-f]{6}$/)]
      ],
      displayOrder: [this.section?.displayOrder || 0],
      isActive: [this.section?.isActive !== undefined ? this.section.isActive : true]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.sectionForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.sectionForm.invalid) {
      Object.keys(this.sectionForm.controls).forEach(key => {
        this.sectionForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;
    this.submitSuccess = null;

    const formValue = this.sectionForm.value;

    if (this.isEditMode && this.section) {
      const updateData: UpdateTestSectionDto = {
        name: formValue.name,
        code: formValue.code || undefined,
        description: formValue.description || undefined,
        color: formValue.color || undefined,
        displayOrder: formValue.displayOrder,
        isActive: formValue.isActive
      };

      this.sectionService.updateTestSection(this.section.id.toString(), updateData)
        .subscribe({
          next: (updatedSection) => {
            this.submitSuccess = 'Sección actualizada exitosamente';
            setTimeout(() => {
              this.saved.emit(updatedSection);
            }, 1000);
          },
          error: (err) => {
            this.submitError = err.message || 'Error al actualizar la sección';
            this.isSubmitting = false;
          }
        });
    } else {
      const createData: CreateTestSectionDto = {
        name: formValue.name,
        code: formValue.code || undefined,
        description: formValue.description || undefined,
        color: formValue.color || undefined,
        displayOrder: formValue.displayOrder
      };

      this.sectionService.createTestSection(createData)
        .subscribe({
          next: (newSection) => {
            this.submitSuccess = 'Sección creada exitosamente';
            setTimeout(() => {
              this.saved.emit(newSection);
            }, 1000);
          },
          error: (err) => {
            this.submitError = err.message || 'Error al crear la sección';
            this.isSubmitting = false;
          }
        });
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
