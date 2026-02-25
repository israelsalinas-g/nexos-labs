import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PatientService } from '../../../services/patient.service';
import { CreatePatientRequest, Patient } from '../../../models/patient.interface';
import { BloodType, BloodTypeLabels } from '../../../enums/blood-type.enums';
import { Genres, GenresLabels } from '../../../enums/genres.enums';

@Component({
  selector: 'app-patient-quick-create-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <!-- Modal Backdrop -->
    <div class="modal-backdrop" (click)="onCancel()" *ngIf="isVisible"></div>
    
    <!-- Modal Content -->
    <div class="modal-container" *ngIf="isVisible">
      <div class="modal-header">
        <h2>➕ Crear Nuevo Paciente</h2>
        <button class="btn-close" (click)="onCancel()" type="button">
          ✕
        </button>
      </div>

      <!-- Error Message -->
      <div *ngIf="error" class="error-banner">
        <span>⚠️ {{ error }}</span>
        <button type="button" (click)="error = null" class="btn-dismiss">✕</button>
      </div>

      <!-- Success Message -->
      <div *ngIf="successMessage" class="success-banner">
        <span>✅ {{ successMessage }}</span>
      </div>

      <form [formGroup]="quickForm" (ngSubmit)="onSubmit()" class="modal-body">
        
        <!-- Patient Name -->
        <div class="form-group">
          <label for="name">
            Nombre Completo <span class="required">*</span>
          </label>
          <input 
            type="text" 
            id="name"
            formControlName="name"
            class="form-input"
            placeholder="Ej: Juan Pérez García"
            [class.error]="isFieldInvalid('name')">
          <div class="error-text" *ngIf="isFieldInvalid('name')">
            El nombre es obligatorio
          </div>
        </div>

        <!-- DNI and Birth Date -->
        <div class="form-row">
          <div class="form-group">
            <label for="dni">DNI (Opcional)</label>
            <input 
              type="text" 
              id="dni"
              formControlName="dni"
              class="form-input"
              placeholder="0801199012345"
              [class.error]="isFieldInvalid('dni')">
            <div class="error-text" *ngIf="isFieldInvalid('dni')">
              <span *ngIf="quickForm.get('dni')?.errors?.['minlength']">Mínimo 8 números</span>
              <span *ngIf="quickForm.get('dni')?.errors?.['pattern']">Solo números permitidos</span>
            </div>
          </div>

          <div class="form-group">
            <label for="birthDate">
              Fecha de Nacimiento <span class="required">*</span>
            </label>
            <input 
              type="date" 
              id="birthDate"
              formControlName="birthDate"
              class="form-input"
              [class.error]="isFieldInvalid('birthDate')">
            <div class="error-text" *ngIf="isFieldInvalid('birthDate')">
              La fecha es obligatoria
            </div>
          </div>
        </div>

        <!-- Sex and Phone -->
        <div class="form-row">
          <div class="form-group">
            <label for="sex">
              Sexo <span class="required">*</span>
            </label>
            <select 
              id="sex"
              formControlName="sex"
              class="form-input"
              [class.error]="isFieldInvalid('sex')">
              <option *ngFor="let genre of genreOptions" [value]="genre">
                {{ getGenreLabel(genre) }}
              </option>
            </select>
            <div class="error-text" *ngIf="isFieldInvalid('sex')">
              El sexo es obligatorio
            </div>
          </div>

          <div class="form-group">
            <label for="phone">
              Teléfono <span class="required">*</span>
            </label>
            <input 
              type="tel" 
              id="phone"
              formControlName="phone"
              class="form-input"
              placeholder="9999-9999"
              [class.error]="isFieldInvalid('phone')">
            <div class="error-text" *ngIf="isFieldInvalid('phone')">
              El teléfono es obligatorio
            </div>
          </div>
        </div>

        <!-- Email (Optional) -->
        <div class="form-group">
          <label for="email">Email (Opcional)</label>
          <input 
            type="email" 
            id="email"
            formControlName="email"
            class="form-input"
            placeholder="ejemplo@correo.com"
            [class.error]="isFieldInvalid('email')">
          <div class="error-text" *ngIf="isFieldInvalid('email')">
            Formato de email inválido
          </div>
        </div>

        <!-- Blood Type -->
        <div class="form-group">
          <label for="bloodType">Tipo de Sangre (Opcional)</label>
          <select 
            id="bloodType"
            formControlName="bloodType"
            class="form-input">
            <option *ngFor="let type of bloodTypeOptions" [value]="type">
              {{ getBloodTypeLabel(type) }}
            </option>
          </select>
        </div>

        <!-- Helper Text -->
        <div class="helper-text">
          <p>
            💡 <strong>Nota:</strong> Este formulario crea un paciente con información básica. 
            Puede completar datos adicionales (historial médico, alergias, etc.) editando el paciente después.
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="modal-footer">
          <button 
            type="button" 
            class="btn btn-secondary" 
            (click)="onCancel()"
            [disabled]="submitting">
            Cancelar
          </button>
          <button 
            type="submit" 
            class="btn btn-primary"
            [disabled]="quickForm.invalid || submitting">
            <span *ngIf="submitting" class="spinner"></span>
            {{ submitting ? 'Creando...' : 'Crear Paciente' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    /* Modal Backdrop */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    /* Modal Container */
    .modal-container {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      z-index: 1001;
      display: flex;
      flex-direction: column;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translate(-50%, -48%);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -50%);
      }
    }

    /* Modal Header */
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 25px;
      border-bottom: 2px solid #e9ecef;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px 12px 0 0;
    }

    .modal-header h2 {
      margin: 0;
      color: white;
      font-size: 20px;
      font-weight: 600;
    }

    .btn-close {
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      font-size: 24px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      line-height: 1;
      padding: 0;
    }

    .btn-close:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: rotate(90deg);
    }

    /* Modal Body */
    .modal-body {
      padding: 25px;
      overflow-y: auto;
      max-height: calc(90vh - 180px);
    }

    /* Error/Success Banners */
    .error-banner, .success-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 20px;
      margin: 0;
      font-size: 14px;
      font-weight: 500;
    }

    .error-banner {
      background-color: #fee;
      color: #c33;
      border-bottom: 1px solid #fcc;
    }

    .success-banner {
      background-color: #efe;
      color: #3c3;
      border-bottom: 1px solid #cfc;
    }

    .btn-dismiss {
      background: none;
      border: none;
      color: inherit;
      font-size: 20px;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.7;
      transition: opacity 0.2s;
    }

    .btn-dismiss:hover {
      opacity: 1;
    }

    /* Form Elements */
    .form-group {
      margin-bottom: 20px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 20px;
    }

    .form-group label {
      display: block;
      margin-bottom: 6px;
      font-weight: 600;
      color: #2c3e50;
      font-size: 14px;
    }

    .required {
      color: #e74c3c;
    }

    .form-input {
      width: 100%;
      padding: 10px 12px;
      border: 2px solid #e1e8ed;
      border-radius: 6px;
      font-size: 14px;
      transition: all 0.2s;
      box-sizing: border-box;
    }

    .form-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-input.error {
      border-color: #e74c3c;
    }

    .error-text {
      color: #e74c3c;
      font-size: 12px;
      margin-top: 4px;
      font-weight: 500;
    }

    /* Helper Text */
    .helper-text {
      background: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 12px 15px;
      margin: 20px 0;
      border-radius: 4px;
    }

    .helper-text p {
      margin: 0;
      font-size: 13px;
      color: #495057;
      line-height: 1.5;
    }

    /* Modal Footer */
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 20px;
      margin-top: 10px;
      border-top: 1px solid #e9ecef;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #5a6268;
    }

    .spinner {
      width: 14px;
      height: 14px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Responsive Design */
    @media (max-width: 640px) {
      .modal-container {
        width: 95%;
        max-height: 95vh;
      }

      .form-row {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .modal-header {
        padding: 15px 20px;
      }

      .modal-body {
        padding: 20px;
        max-height: calc(95vh - 160px);
      }

      .modal-footer {
        flex-direction: column;
      }

      .btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class PatientQuickCreateModalComponent implements OnInit {
  @Output() patientCreated = new EventEmitter<Patient>();
  @Output() modalClosed = new EventEmitter<void>();

  quickForm: FormGroup;
  isVisible = false;
  
  // Opciones de género y tipo de sangre con sus etiquetas
  readonly genreOptions = Object.values(Genres);
  readonly genreLabels = GenresLabels;
  readonly bloodTypeOptions = Object.values(BloodType);
  readonly bloodTypeLabels = BloodTypeLabels;
  
  submitting = false;
  error: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService
  ) {
    this.quickForm = this.createForm();
  }

  ngOnInit(): void {
    // Form is ready
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required]],
      dni: ['', [Validators.minLength(8), Validators.pattern(/^[0-9]+$/)]],
      birthDate: ['', [Validators.required]],
      sex: [Genres.FEMALE, [Validators.required]], // Valor por defecto: Femenino
      phone: ['', [Validators.required]],
      email: ['', [Validators.email]],
      bloodType: [BloodType.UNKNOWN] // Valor por defecto: Desconocido
    });
  }

  open(): void {
    this.isVisible = true;
    this.quickForm.reset();
    this.error = null;
    this.successMessage = null;
  }

  close(): void {
    this.isVisible = false;
    this.modalClosed.emit();
  }

  onCancel(): void {
    if (!this.submitting) {
      this.close();
    }
  }

  onSubmit(): void {
    if (this.quickForm.invalid || this.submitting) {
      this.markAllFieldsAsTouched();
      return;
    }

    this.submitting = true;
    this.error = null;
    this.successMessage = null;

    const formValue = this.quickForm.value;
    const age = this.calculateAge(formValue.birthDate);

    // Construir objeto solo con campos requeridos
    const patientData: CreatePatientRequest = {
      name: formValue.name,
      birthDate: formValue.birthDate,
      age: age,
      sex: formValue.sex,
      phone: formValue.phone
    };

    // Agregar campos opcionales solo si tienen valor
    if (formValue.dni && formValue.dni.trim()) {
      patientData.dni = formValue.dni.trim();
    }
    
    if (formValue.email && formValue.email.trim()) {
      patientData.email = formValue.email.trim();
    }
    
    if (formValue.bloodType && formValue.bloodType !== BloodType.UNKNOWN) {
      patientData.bloodType = formValue.bloodType;
    }

    this.patientService.createPatient(patientData).subscribe({
      next: (createdPatient) => {
        this.successMessage = 'Paciente creado exitosamente';
        this.submitting = false;
        setTimeout(() => {
          this.patientCreated.emit(createdPatient);
          this.close();
        }, 1000);
      },
      error: (err) => {
        this.error = err.message || 'Error al crear el paciente';
        this.submitting = false;
      }
    });
  }

  private calculateAge(birthDate: string): number {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return Math.max(0, age);
  }

  getGenreLabel(genre: string): string {
    return this.genreLabels[genre as Genres] || genre;
  }

  getBloodTypeLabel(bloodType: string): string {
    return this.bloodTypeLabels[bloodType as BloodType] || bloodType;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.quickForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.quickForm.controls).forEach(key => {
      this.quickForm.get(key)?.markAsTouched();
    });
  }
}
