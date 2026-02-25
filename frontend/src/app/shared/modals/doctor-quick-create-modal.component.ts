import { Component, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DoctorService } from '../../services/doctor.service';
import { CreateDoctorRequest } from '../../models/doctor.interface';

@Component({
  selector: 'app-doctor-quick-create-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div #modalOverlay class="modal-overlay" [class.show]="isOpen" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Crear Nuevo Médico</h2>
          <button type="button" class="btn-close" (click)="closeModal()">×</button>
        </div>

        <form [formGroup]="doctorForm" class="modal-body">
          <div class="form-group">
            <label for="firstName">Nombre *</label>
            <input
              id="firstName"
              type="text"
              formControlName="firstName"
              class="form-control"
              placeholder="Ej: Juan"
              required>
            <div *ngIf="getFieldError('firstName')" class="error-message">
              {{ getFieldError('firstName') }}
            </div>
          </div>

          <div class="form-group">
            <label for="lastName">Apellido *</label>
            <input
              id="lastName"
              type="text"
              formControlName="lastName"
              class="form-control"
              placeholder="Ej: Pérez"
              required>
            <div *ngIf="getFieldError('lastName')" class="error-message">
              {{ getFieldError('lastName') }}
            </div>
          </div>

          <div class="form-group">
            <label for="specialty">Especialidad</label>
            <input
              id="specialty"
              type="text"
              formControlName="specialty"
              class="form-control"
              placeholder="Ej: Pediatría">
            <div *ngIf="getFieldError('specialty')" class="error-message">
              {{ getFieldError('specialty') }}
            </div>
          </div>

          <div class="form-group">
            <label for="licenseNumber">Número de Licencia</label>
            <input
              id="licenseNumber"
              type="text"
              formControlName="licenseNumber"
              class="form-control"
              placeholder="Ej: LIC-12345">
            <div *ngIf="getFieldError('licenseNumber')" class="error-message">
              {{ getFieldError('licenseNumber') }}
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="form-control"
              placeholder="doctor@example.com">
            <div *ngIf="getFieldError('email')" class="error-message">
              {{ getFieldError('email') }}
            </div>
          </div>

          <div class="form-group">
            <label for="phone">Teléfono</label>
            <input
              id="phone"
              type="tel"
              formControlName="phone"
              class="form-control"
              placeholder="+1 234 567 8900">
            <div *ngIf="getFieldError('phone')" class="error-message">
              {{ getFieldError('phone') }}
            </div>
          </div>

          <div class="form-group">
            <label for="address">Dirección</label>
            <input
              id="address"
              type="text"
              formControlName="address"
              class="form-control"
              placeholder="Calle, ciudad...">
            <div *ngIf="getFieldError('address')" class="error-message">
              {{ getFieldError('address') }}
            </div>
          </div>

          <div class="form-group">
            <label for="institution">Institución</label>
            <input
              id="institution"
              type="text"
              formControlName="institution"
              class="form-control"
              placeholder="Nombre del hospital o clínica">
            <div *ngIf="getFieldError('institution')" class="error-message">
              {{ getFieldError('institution') }}
            </div>
          </div>

          <div class="form-group checkbox">
            <label>
              <input
                type="checkbox"
                formControlName="isStaff"
                class="form-checkbox">
              <span>Es Personal de Staff</span>
            </label>
          </div>

          <div class="form-group checkbox">
            <label>
              <input
                type="checkbox"
                formControlName="isActive"
                class="form-checkbox">
              <span>Activo</span>
            </label>
          </div>

          <div class="form-group">
            <label for="notes">Notas</label>
            <textarea
              id="notes"
              formControlName="notes"
              class="form-control"
              placeholder="Notas adicionales..."
              rows="3"></textarea>
          </div>

          <div *ngIf="errorMessage" class="alert alert-error">
            {{ errorMessage }}
          </div>
        </form>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="closeModal()">
            Cancelar
          </button>
          <button
            type="button"
            class="btn btn-primary"
            (click)="saveDoctore()"
            [disabled]="!doctorForm.valid || saving">
            {{ saving ? 'Guardando...' : 'Crear Médico' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      align-items: center;
      justify-content: center;
    }

    .modal-overlay.show {
      display: flex;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      max-width: 600px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateY(-50px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #e2e8f0;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #2d3748;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 2rem;
      cursor: pointer;
      color: #718096;
      padding: 0;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;
    }

    .btn-close:hover {
      color: #2d3748;
    }

    .modal-body {
      padding: 20px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-group.checkbox {
      flex-direction: row;
      align-items: center;
    }

    .form-group.checkbox label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      margin: 0;
    }

    .form-group label {
      font-weight: 600;
      color: #4a5568;
      font-size: 0.9rem;
    }

    .form-control {
      padding: 10px 12px;
      border: 2px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.95rem;
      font-family: inherit;
      transition: all 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: #4299e1;
      box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
    }

    .form-checkbox {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .error-message {
      color: #e53e3e;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .alert {
      padding: 12px 16px;
      border-radius: 6px;
      font-weight: 500;
      margin-bottom: 15px;
      grid-column: 1 / -1;
    }

    .alert-error {
      background: #fed7d7;
      color: #c53030;
      border-left: 4px solid #f56565;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 20px;
      border-top: 1px solid #e2e8f0;
      background: #f7fafc;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-primary {
      background: #4299e1;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #3182ce;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(66, 153, 225, 0.3);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #edf2f7;
      color: #4a5568;
      border: 1px solid #cbd5e0;
    }

    .btn-secondary:hover {
      background: #e2e8f0;
    }
  `]
})
export class DoctorQuickCreateModalComponent {
  @Output() doctorCreated = new EventEmitter<any>();
  @ViewChild('modalOverlay') modalOverlay!: ElementRef;

  isOpen = false;
  saving = false;
  errorMessage = '';

  doctorForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private doctorService: DoctorService
  ) {
    this.doctorForm = this.createForm();
  }

  createForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      specialty: [''],
      licenseNumber: [''],
      email: ['', [Validators.email]],
      phone: [''],
      address: [''],
      institution: [''],
      isStaff: [false],
      isActive: [true],
      notes: ['']
    });
  }

  openModal(): void {
    this.isOpen = true;
    this.errorMessage = '';
    this.doctorForm.reset({
      isActive: true,
      isStaff: false
    });
  }

  closeModal(): void {
    this.isOpen = false;
    this.errorMessage = '';
    this.doctorForm.reset();
  }

  getFieldError(fieldName: string): string | null {
    const field = this.doctorForm.get(fieldName);
    if (!field || !field.errors || !field.touched) {
      return null;
    }

    if (field.errors['required']) {
      return `${this.getLabelForField(fieldName)} es requerido`;
    }
    if (field.errors['minlength']) {
      return `${this.getLabelForField(fieldName)} debe tener al menos ${field.errors['minlength'].requiredLength} caracteres`;
    }
    if (field.errors['email']) {
      return 'El email debe ser válido';
    }

    return null;
  }

  private getLabelForField(fieldName: string): string {
    const labels: { [key: string]: string } = {
      firstName: 'Nombre',
      lastName: 'Apellido',
      specialty: 'Especialidad',
      licenseNumber: 'Número de Licencia',
      email: 'Email',
      phone: 'Teléfono',
      address: 'Dirección',
      institution: 'Institución',
      notes: 'Notas'
    };
    return labels[fieldName] || fieldName;
  }

  saveDoctore(): void {
    if (!this.doctorForm.valid) {
      this.markFormGroupTouched(this.doctorForm);
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    const newDoctor: CreateDoctorRequest = this.doctorForm.value;

    this.doctorService.createDoctor(newDoctor).subscribe({
      next: (doctor) => {
        this.saving = false;
        this.doctorCreated.emit(doctor);
        this.closeModal();
      },
      error: (error) => {
        this.saving = false;
        console.error('Error creating doctor:', error);
        this.errorMessage = error.error?.message || 'Error al crear el médico. Intente nuevamente.';
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
