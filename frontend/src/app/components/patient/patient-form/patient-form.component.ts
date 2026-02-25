import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Patient, CreatePatientRequest, UpdatePatientRequest } from '../../../models/patient.interface';
import { PatientService } from '../../../services/patient.service';
import { AgeCalculatorService } from '../../../services/age-calculator.service';
import { Genres, GenresLabels } from '../../../enums/genres.enums';
import { BloodType, BloodTypeLabels } from '../../../enums/blood-type.enums';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>{{ isEditMode ? 'Editar Paciente' : 'Nuevo Paciente' }}</h1>
        <button class="btn-secondary" [routerLink]="['/patients']">
          ← Volver a la lista
        </button>
      </div>

      <!-- Error general -->
      <div *ngIf="error" class="error-message">
        {{ error }}
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="loading">
        {{ isEditMode ? 'Cargando datos del paciente...' : 'Guardando...' }}
      </div>

      <!-- Formulario -->
      <form [formGroup]="patientForm" (ngSubmit)="onSubmit()" *ngIf="!loading" class="patient-form">
        
        <!-- Información Personal -->
        <div class="form-section">
          <h3>Información Personal</h3>
          <div class="form-grid">
            <div class="form-group">
              <label for="name">Nombre Completo *</label>
              <input 
                type="text" 
                id="name"
                formControlName="name"
                class="form-control"
                [class.error]="isFieldInvalid('name')">
              <div class="error-text" *ngIf="isFieldInvalid('name')">
                El nombre es obligatorio
              </div>
            </div>

            <div class="form-group">
              <label for="dni">DNI</label>
              <input 
                type="text" 
                id="dni"
                formControlName="dni"
                class="form-control"
                placeholder="13 números"
                [class.error]="isFieldInvalid('dni')">
              <div class="error-text" *ngIf="isFieldInvalid('dni')">
                <span *ngIf="patientForm.get('dni')?.errors?.['minlength']">El DNI debe tener 13 números</span>
                <span *ngIf="patientForm.get('dni')?.errors?.['pattern']">El DNI debe contener solo números</span>
              </div>
            </div>

            <div class="form-group">
              <label for="birthDate">Fecha de Nacimiento *</label>
              <input 
                type="date" 
                id="birthDate"
                formControlName="birthDate"
                class="form-control"
                [class.error]="isFieldInvalid('birthDate')">
              <div class="error-text" *ngIf="isFieldInvalid('birthDate')">
                La fecha de nacimiento es obligatoria
              </div>
            </div>

            <div class="form-group">
              <label for="age">Edad Calculada</label>
              <input 
                type="number" 
                id="age"
                formControlName="age"
                class="form-control"
                [disabled]="true">
              <small class="form-hint">Se calcula automáticamente según la fecha de nacimiento</small>
            </div>

            <div class="form-group">
              <label for="sex">Sexo *</label>
              <select 
                id="sex"
                formControlName="sex"
                class="form-control"
                [class.error]="isFieldInvalid('sex')">
                <option value="" disabled>Seleccionar sexo</option>
                <option *ngFor="let genre of genreOptions" [value]="genre">
                  {{ getGenreLabel(genre) }}
                </option>
              </select>
              <div class="error-text" *ngIf="isFieldInvalid('sex')">
                El sexo es obligatorio
              </div>
            </div>

            <div class="form-group">
              <label for="referenceGroup">Grupo de Referencia</label>
              <input 
                type="text" 
                id="referenceGroup"
                formControlName="referenceGroup"
                class="form-control"
                placeholder="Ej: Adulto, Pediátrico, Geriátrico">
            </div>

            <div class="form-group">
              <label for="bloodType">Tipo de Sangre</label>
              <select 
                id="bloodType"
                formControlName="bloodType"
                class="form-control">
                <option value="">Seleccionar tipo de sangre</option>
                <option *ngFor="let bloodType of bloodTypeOptions" [value]="bloodType">
                  {{ getBloodTypeLabel(bloodType) }}
                </option>
              </select>
            </div>

          </div>
        </div>

        <!-- Información de Contacto -->
        <div class="form-section">
          <h3>Información de Contacto</h3>
          <div class="form-grid">
            <div class="form-group">
              <label for="phone">Teléfono *</label>
              <input 
                type="tel" 
                id="phone"
                formControlName="phone"
                class="form-control"
                [class.error]="isFieldInvalid('phone')">
              <div class="error-text" *ngIf="isFieldInvalid('phone')">
                El teléfono es obligatorio
              </div>
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <input 
                type="email" 
                id="email"
                formControlName="email"
                class="form-control"
                [class.error]="isFieldInvalid('email')">
              <div class="error-text" *ngIf="isFieldInvalid('email')">
                <span *ngIf="patientForm.get('email')?.errors?.['email']">Formato de email inválido</span>
              </div>
            </div>

            <div class="form-group full-width">
              <label for="address">Dirección</label>
              <textarea 
                id="address"
                formControlName="address"
                class="form-control"
                rows="2"
                placeholder="Dirección completa del paciente"></textarea>
            </div>
          </div>
        </div>

        <!-- Información Médica -->
        <div class="form-section">
          <h3>Información Médica</h3>
          <div class="form-group">
            <label for="allergies">Alergias</label>
            <textarea 
              id="allergies"
              formControlName="allergies"
              class="form-control"
              rows="3"
              placeholder="Describir alergias conocidas (medicamentos, alimentos, ambientales, etc.)"></textarea>
          </div>

          <div class="form-group">
            <label for="medicalHistory">Historia Médica</label>
            <textarea 
              id="medicalHistory"
              formControlName="medicalHistory"
              class="form-control"
              rows="4"
              placeholder="Enfermedades previas, cirugías, hospitalizaciones, etc."></textarea>
          </div>

          <div class="form-group">
            <label for="currentMedications">Medicamentos Actuales</label>
            <textarea 
              id="currentMedications"
              formControlName="currentMedications"
              class="form-control"
              rows="3"
              placeholder="Medicamentos que toma actualmente (incluir dosis y frecuencia)"></textarea>
          </div>

          <div class="form-group">
            <label for="notes">Notas Adicionales</label>
            <textarea 
              id="notes"
              formControlName="notes"
              class="form-control"
              rows="3"
              placeholder="Cualquier información adicional relevante"></textarea>
          </div>
        </div>

        <!-- Contacto de Emergencia -->
        <div class="form-section">
          <h3>Contacto de Emergencia</h3>
          <div class="form-grid">
            <div class="form-group">
              <label for="emergencyContactName">Nombre del Contacto</label>
              <input 
                type="text" 
                id="emergencyContactName"
                formControlName="emergencyContactName"
                class="form-control"
                [class.error]="isFieldInvalid('emergencyContactName')">
              <div class="error-text" *ngIf="isFieldInvalid('emergencyContactName')">
                El nombre del contacto de emergencia es obligatorio
              </div>
            </div>

            <div class="form-group">
              <label for="emergencyContactRelationship">Relación</label>
              <input 
                type="text" 
                id="emergencyContactRelationship"
                formControlName="emergencyContactRelationship"
                class="form-control"
                placeholder="Ej: Padre, Madre, Cónyuge, Hermano/a">
            </div>

            <div class="form-group">
              <label for="emergencyContactPhone">Teléfono de Emergencia</label>
              <input 
                type="tel" 
                id="emergencyContactPhone"
                formControlName="emergencyContactPhone"
                class="form-control"
                [class.error]="isFieldInvalid('emergencyContactPhone')">
              <div class="error-text" *ngIf="isFieldInvalid('emergencyContactPhone')">
                El teléfono de emergencia es obligatorio
              </div>
            </div>
          </div>
        </div>

        <!-- Estado -->
        <div class="form-section" *ngIf="isEditMode">
          <h3>Estado</h3>
          <div class="form-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                formControlName="isActive"
                class="checkbox">
              Paciente activo
            </label>
            <small class="help-text">
              Los pacientes inactivos no aparecerán en las búsquedas por defecto
            </small>
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="form-actions">
          <button type="button" class="btn-secondary" [routerLink]="['/patients']">
            Cancelar
          </button>
          <button 
            type="submit" 
            class="btn-primary"
            [disabled]="patientForm.invalid || submitting">
            {{ submitting ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear') }} Paciente
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }

    .header h1 {
      color: #2c3e50;
      margin: 0;
    }

    .error-message {
      background-color: #f8d7da;
      color: #721c24;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 20px;
      border: 1px solid #f5c6cb;
    }

    .loading {
      text-align: center;
      padding: 40px;
      font-size: 16px;
      color: #6c757d;
    }

    .patient-form {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .form-section {
      padding: 30px;
      border-bottom: 1px solid #ecf0f1;
    }

    .form-section:last-of-type {
      border-bottom: none;
    }

    .form-section h3 {
      color: #2c3e50;
      margin: 0 0 20px 0;
      font-size: 18px;
      border-bottom: 2px solid #3498db;
      padding-bottom: 8px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-group label {
      font-weight: 600;
      margin-bottom: 5px;
      color: #2c3e50;
    }

    .form-control {
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      transition: border-color 0.3s;
    }

    .form-control:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }

    .form-control.error {
      border-color: #e74c3c;
    }

    .error-text {
      color: #e74c3c;
      font-size: 12px;
      margin-top: 5px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-weight: normal;
    }

    .checkbox {
      width: 16px;
      height: 16px;
    }

    .help-text {
      color: #6c757d;
      font-size: 12px;
      margin-top: 5px;
    }

    .form-hint {
      color: #6c757d;
      font-size: 12px;
      margin-top: 5px;
      display: block;
    }

    .form-actions {
      padding: 30px;
      background-color: #f8f9fa;
      display: flex;
      gap: 15px;
      justify-content: flex-end;
    }

    .btn-primary {
      background-color: #3498db;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      transition: background-color 0.3s;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #2980b9;
    }

    .btn-primary:disabled {
      background-color: #bdc3c7;
      cursor: not-allowed;
    }

    .btn-secondary {
      background-color: #95a5a6;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      text-decoration: none;
      display: inline-block;
      text-align: center;
    }

    .btn-secondary:hover {
      background-color: #7f8c8d;
    }

    @media (max-width: 768px) {
      .container {
        padding: 10px;
      }

      .header {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .form-section {
        padding: 20px;
      }

      .form-actions {
        flex-direction: column;
        padding: 20px;
      }
    }
  `]
})
export class PatientFormComponent implements OnInit, OnDestroy, AfterViewInit {
  patientForm: FormGroup;
  isEditMode = false;
  patientId: string | null = null;
  loading = false;
  submitting = false;
  error: string | null = null;

  // Opciones de género usando el enum
  readonly genreOptions = Object.values(Genres);
  readonly genreLabels = GenresLabels;
  readonly bloodTypeOptions = Object.values(BloodType);
  readonly bloodTypeLabels = BloodTypeLabels;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private patientService: PatientService,
    private ageCalculatorService: AgeCalculatorService
  ) {
    this.patientForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.patientId = params['id'];
      this.isEditMode = !!this.patientId;
      
      if (this.isEditMode) {
        this.loadPatient();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      dni: ['', [Validators.minLength(8), Validators.pattern(/^[0-9]+$/)]],
      birthDate: ['', Validators.required],
      age: [{ value: 0, disabled: true }],
      sex: ['', Validators.required], // Sin valor por defecto, debe seleccionar
      phone: ['', Validators.required],
      email: ['', [Validators.email]],
      address: [''],
      bloodType: [BloodType.UNKNOWN], // Valor por defecto: Desconocido
      referenceGroup: [''],
      allergies: [''],
      medicalHistory: [''],
      currentMedications: [''],
      notes: [''],
      emergencyContactName: [''],
      emergencyContactRelationship: [''],
      emergencyContactPhone: [''],
      isActive: [true]
    });
  }

  private loadPatient(): void {
    if (!this.patientId) return;

    this.loading = true;
    this.error = null;

    this.patientService.getPatientById(this.patientId).subscribe({
      next: (patient) => {
        this.populateForm(patient);
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  private populateForm(patient: Patient): void {
    // Calcular edad basada en fecha de nacimiento usando el servicio
    const age = this.ageCalculatorService.calculateAge(patient.birthDate);
    
    this.patientForm.patchValue({
      ...patient,
      age: age
    });

    // Configurar el cálculo automático de edad
    this.setupAgeCalculation();
  }

  ngAfterViewInit(): void {
    // Configurar el cálculo automático de edad para formularios nuevos
    if (!this.isEditMode) {
      this.setupAgeCalculation();
    }
  }

  private setupAgeCalculation(): void {
    this.patientForm.get('birthDate')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(birthDate => {
        if (birthDate) {
          const age = this.ageCalculatorService.calculateAge(birthDate);
          this.patientForm.patchValue({ age: age }, { emitEvent: false });
        }
      });
  }

  private calculateAge(birthDate: string): number {
    return this.ageCalculatorService.calculateAge(birthDate);
  }

  onSubmit(): void {
    if (this.patientForm.invalid || this.submitting) return;

    this.submitting = true;
    this.error = null;

    const formValue = this.patientForm.getRawValue();
    
    // Calcular edad final basada en la fecha de nacimiento usando el servicio
    formValue.age = this.ageCalculatorService.calculateAge(formValue.birthDate);

    // Limpiar datos antes de enviar
    const cleanedData = this.cleanFormData(formValue);

    if (this.isEditMode) {
      // No incluir el ID en el cuerpo de la solicitud, ya va en la URL
      const updateData = { ...cleanedData } as UpdatePatientRequest;
      this.updatePatient(updateData);
    } else {
      this.createPatient(cleanedData);
    }
  }

  private cleanFormData(formData: any): CreatePatientRequest {
    // Remover el campo 'notes' que el backend no acepta
    const { notes, ...cleanData } = formData;

    // Limpiar campos vacíos para evitar problemas de validación
    const cleaned: any = { ...cleanData };

    // Si DNI está vacío, no enviarlo (el backend parece requerirlo con mínimo 8 caracteres)
    if (!cleaned.dni || cleaned.dni.trim() === '') {
      delete cleaned.dni;
    }

    // Si email está vacío, no enviarlo
    if (!cleaned.email || cleaned.email.trim() === '') {
      delete cleaned.email;
    }

    // Limpiar campos de contacto de emergencia vacíos
    if (!cleaned.emergencyContactName || cleaned.emergencyContactName.trim() === '') {
      delete cleaned.emergencyContactName;
    }

    if (!cleaned.emergencyContactPhone || cleaned.emergencyContactPhone.trim() === '') {
      delete cleaned.emergencyContactPhone;
    }

    if (!cleaned.emergencyContactRelationship || cleaned.emergencyContactRelationship.trim() === '') {
      delete cleaned.emergencyContactRelationship;
    }

    // Limpiar otros campos opcionales vacíos
    ['address', 'bloodType', 'referenceGroup', 'allergies', 'medicalHistory', 'currentMedications'].forEach(field => {
      if (!cleaned[field] || cleaned[field].trim() === '') {
        delete cleaned[field];
      }
    });

    return cleaned;
  }

  private createPatient(patientData: CreatePatientRequest): void {
    this.patientService.createPatient(patientData).subscribe({
      next: (patient) => {
        this.router.navigate(['/patients']);
      },
      error: (err) => {
        this.error = err.message;
        this.submitting = false;
      }
    });
  }

  private updatePatient(patientData: UpdatePatientRequest): void {
    if (!this.patientId) return;

    this.patientService.updatePatient(this.patientId, patientData).subscribe({
      next: (patient) => {
        this.router.navigate(['/patients']);
      },
      error: (err) => {
        this.error = err.message;
        this.submitting = false;
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.patientForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getGenreLabel(genre: Genres): string {
    return GenresLabels[genre] || genre;
  }

  getBloodTypeLabel(bloodType: BloodType): string {
    return BloodTypeLabels[bloodType] || bloodType;
  }
}
