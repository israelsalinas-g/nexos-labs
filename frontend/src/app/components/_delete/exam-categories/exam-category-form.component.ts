import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExamCategory, CreateExamCategoryDto, UpdateExamCategoryDto } from '../../../models/exam-category.interface';
import { ExamCategoryService } from '../../../services/exam-category.service';

@Component({
  selector: 'app-exam-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-overlay" (click)="onCancel()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ isEditMode ? 'Editar Categoría' : 'Nueva Categoría' }}</h2>
          <button class="close-btn" (click)="onCancel()">&times;</button>
        </div>

        <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()">
          <div class="form-body">
            <!-- Nombre -->
            <div class="form-group">
              <label for="name" class="required">Nombre</label>
              <input 
                id="name"
                type="text" 
                formControlName="name"
                class="form-control"
                placeholder="Ej: Química Sanguínea"
                [class.invalid]="isFieldInvalid('name')">
              <div class="error-message" *ngIf="isFieldInvalid('name')">
                <span *ngIf="categoryForm.get('name')?.errors?.['required']">El nombre es requerido</span>
                <span *ngIf="categoryForm.get('name')?.errors?.['minlength']">Mínimo 2 caracteres</span>
                <span *ngIf="categoryForm.get('name')?.errors?.['maxlength']">Máximo 100 caracteres</span>
              </div>
            </div>

            <!-- Código -->
            <div class="form-group">
              <label for="code">Código</label>
              <input 
                id="code"
                type="text" 
                formControlName="code"
                class="form-control"
                placeholder="Ej: QS"
                [class.invalid]="isFieldInvalid('code')">
              <div class="error-message" *ngIf="isFieldInvalid('code')">
                <span *ngIf="categoryForm.get('code')?.errors?.['maxlength']">Máximo 20 caracteres</span>
              </div>
            </div>

            <!-- Descripción -->
            <div class="form-group">
              <label for="description">Descripción</label>
              <textarea 
                id="description"
                formControlName="description"
                class="form-control"
                rows="3"
                placeholder="Descripción de la categoría"></textarea>
            </div>

            <!-- Color y Display Order en una fila -->
            <div class="form-row">
              <!-- Color -->
              <div class="form-group">
                <label for="color">Color</label>
                <div class="color-input-wrapper">
                  <input 
                    id="color"
                    type="color" 
                    formControlName="color"
                    class="color-picker">
                  <input 
                    type="text" 
                    formControlName="color"
                    class="form-control color-text"
                    placeholder="#4CAF50"
                    [class.invalid]="isFieldInvalid('color')">
                </div>
                <div class="error-message" *ngIf="isFieldInvalid('color')">
                  <span *ngIf="categoryForm.get('color')?.errors?.['pattern']">
                    Formato inválido. Use #RRGGBB (ej: #4CAF50)
                  </span>
                </div>
              </div>

              <!-- Display Order -->
              <div class="form-group">
                <label for="displayOrder">Orden</label>
                <input 
                  id="displayOrder"
                  type="number" 
                  formControlName="displayOrder"
                  class="form-control"
                  placeholder="0"
                  min="0">
              </div>
            </div>

            <!-- Estado Activo -->
            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  formControlName="isActive"
                  class="checkbox-input">
                <span>Categoría activa</span>
              </label>
            </div>

            <!-- Mensajes de error generales -->
            <div class="error-message" *ngIf="submitError">
              {{ submitError }}
            </div>

            <!-- Mensaje de éxito -->
            <div class="success-message" *ngIf="submitSuccess">
              {{ submitSuccess }}
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="onCancel()">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" [disabled]="categoryForm.invalid || isSubmitting">
              {{ isSubmitting ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      padding: 20px;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #e0e0e0;
    }

    .modal-header h2 {
      margin: 0;
      color: #2c3e50;
      font-size: 24px;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 28px;
      cursor: pointer;
      color: #999;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-btn:hover {
      color: #333;
    }

    .form-body {
      padding: 20px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }

    label {
      display: block;
      margin-bottom: 5px;
      color: #34495e;
      font-weight: 500;
      font-size: 14px;
    }

    label.required::after {
      content: ' *';
      color: #e74c3c;
    }

    .form-control {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
    }

    .form-control:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
    }

    .form-control.invalid {
      border-color: #e74c3c;
    }

    .form-control.invalid:focus {
      box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.1);
    }

    textarea.form-control {
      resize: vertical;
      min-height: 80px;
    }

    .color-input-wrapper {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .color-picker {
      width: 50px;
      height: 42px;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
    }

    .color-text {
      flex: 1;
    }

    .checkbox-group {
      display: flex;
      align-items: center;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      cursor: pointer;
      margin: 0;
    }

    .checkbox-input {
      width: 18px;
      height: 18px;
      margin-right: 8px;
      cursor: pointer;
    }

    .error-message {
      color: #e74c3c;
      font-size: 13px;
      margin-top: 5px;
    }

    .success-message {
      color: #27ae60;
      font-size: 13px;
      margin-top: 5px;
      padding: 10px;
      background-color: #d4edda;
      border-radius: 4px;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 20px;
      border-top: 1px solid #e0e0e0;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .btn-primary {
      background-color: #3498db;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #2980b9;
    }

    .btn-primary:disabled {
      background-color: #95a5a6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background-color: #95a5a6;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #7f8c8d;
    }

    @media (max-width: 768px) {
      .modal-content {
        max-width: 100%;
        margin: 0;
        border-radius: 0;
        max-height: 100vh;
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ExamCategoryFormComponent implements OnInit {
  @Input() category?: ExamCategory;
  @Output() saved = new EventEmitter<ExamCategory>();
  @Output() cancelled = new EventEmitter<void>();

  categoryForm!: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  submitError: string | null = null;
  submitSuccess: string | null = null;

  constructor(
    private fb: FormBuilder,
    private categoryService: ExamCategoryService
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.category;
    this.initForm();
  }

  initForm(): void {
    this.categoryForm = this.fb.group({
      name: [
        this.category?.name || '', 
        [Validators.required, Validators.minLength(2), Validators.maxLength(100)]
      ],
      code: [
        this.category?.code || '', 
        [Validators.maxLength(20)]
      ],
      description: [this.category?.description || ''],
      color: [
        this.category?.color || '#4CAF50', 
        [Validators.pattern(/^#[0-9A-Fa-f]{6}$/)]
      ],
      displayOrder: [this.category?.displayOrder || 0],
      isActive: [this.category?.isActive !== undefined ? this.category.isActive : true]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.categoryForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      Object.keys(this.categoryForm.controls).forEach(key => {
        this.categoryForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;
    this.submitSuccess = null;

    const formValue = this.categoryForm.value;

    if (this.isEditMode && this.category) {
      const updateData: UpdateExamCategoryDto = {
        name: formValue.name,
        code: formValue.code || undefined,
        description: formValue.description || undefined,
        color: formValue.color || undefined,
        displayOrder: formValue.displayOrder,
        isActive: formValue.isActive
      };

      this.categoryService.updateExamCategory(this.category.id.toString(), updateData)
        .subscribe({
          next: (updatedCategory) => {
            this.submitSuccess = 'Categoría actualizada exitosamente';
            setTimeout(() => {
              this.saved.emit(updatedCategory);
            }, 1000);
          },
          error: (err) => {
            this.submitError = err.message || 'Error al actualizar la categoría';
            this.isSubmitting = false;
          }
        });
    } else {
      const createData: CreateExamCategoryDto = {
        name: formValue.name,
        code: formValue.code || undefined,
        description: formValue.description || undefined,
        color: formValue.color || undefined,
        displayOrder: formValue.displayOrder
      };

      this.categoryService.createExamCategory(createData)
        .subscribe({
          next: (newCategory) => {
            this.submitSuccess = 'Categoría creada exitosamente';
            setTimeout(() => {
              this.saved.emit(newCategory);
            }, 1000);
          },
          error: (err) => {
            this.submitError = err.message || 'Error al crear la categoría';
            this.isSubmitting = false;
          }
        });
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
