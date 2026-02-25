import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { PatientQuickCreateModalComponent } from '../../patient/patient-form/patient-quick-create-modal.component';
import { DoctorQuickCreateModalComponent } from '../../../shared/modals/doctor-quick-create-modal.component';
import { 
  UrineTest, 
  CreateUrineTestDto, 
  UpdateUrineTestDto
} from '../../../models/urine-test.interface';
import { UrineTestService } from '../../../services/urine-test.service';
import { PatientService } from '../../../services/patient.service';
import { DoctorService } from '../../../services/doctor.service';
import { AuthService } from '../../../services/auth.service';
import { Doctor } from '../../../models/doctor.interface';
import { 
  UrineColor, 
  UrineAspect, 
  UrineDensity, 
  UrinePH,  
  Urobilinogen,
  CylinderType,
  CrystalType,
  UrineTestEnumHelpers
} from '../../../enums/urine-test.enums';
import { PatientInfo, Patient } from '../../../models/patient.interface';
import { EscasaModeradaAbundanteAusenteQuantity } from '../../../enums/escasa-moderada-abundante-ausente.enums';
import { NegativePositive } from '../../../enums/negetive-positive.enums';
import { NegativePositive3Plus } from '../../../enums/negetive-positive-3-plus.enums';
import { NegativePositive4Plus } from '../../../enums/negetive-positive-4-plus.enums';
import { TestStatus } from '../../../enums/test-status.enums';

@Component({
  selector: 'app-urine-test-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PatientQuickCreateModalComponent, DoctorQuickCreateModalComponent],
  templateUrl: './urine-test-form.component.html',
  styleUrls: ['./urine-test-form.component.css']
})
export class UrineTestFormComponent implements OnInit, OnDestroy {
  @ViewChild(PatientQuickCreateModalComponent) patientModal!: PatientQuickCreateModalComponent;
  @ViewChild(DoctorQuickCreateModalComponent) doctorModal!: DoctorQuickCreateModalComponent;

  // Default healthy values constants
  private readonly DEFAULT_VALUES = {
    // Physical examination defaults
    color: UrineColor.AMARILLO,
    aspect: UrineAspect.TRANSPARENTE,
    sediment: EscasaModeradaAbundanteAusenteQuantity.NO_SE_OBSERVA,

    // Chemical examination defaults
    density: UrineDensity.D1020,
    ph: UrinePH.PH60,
    protein: NegativePositive4Plus.NEGATIVO,
    glucose: NegativePositive4Plus.NEGATIVO,
    ketones: NegativePositive3Plus.NEGATIVO,
    occultBlood: NegativePositive3Plus.NEGATIVO,
    nitrites: NegativePositive3Plus.NEGATIVO,
    urobilinogen: Urobilinogen.U01,
    leukocytes: NegativePositive3Plus.NEGATIVO,
    bilirubin: NegativePositive3Plus.NEGATIVO,

    // Microscopic examination defaults
    epithelialCells: EscasaModeradaAbundanteAusenteQuantity.ESCASA,
    leukocytesField: '0-2 x campo',
    erythrocytesField: '0-2 x campo',
    bacteria: EscasaModeradaAbundanteAusenteQuantity.ESCASA,
    mucousFilaments: EscasaModeradaAbundanteAusenteQuantity.ESCASA,
    yeasts: EscasaModeradaAbundanteAusenteQuantity.ESCASA
  };

  urineTestForm: FormGroup;
  patients: PatientInfo[] = [];
  doctors: Doctor[] = [];
  currentUrineTest: UrineTest | null = null;
  loading = false;
  saving = false;
  loadingDoctors = false;
  error: string | null = null;
  successMessage: string | null = null;
  isEditMode = false;
  readOnly = false;
  testId: string | null = null;
  private routeParamsSubscription?: Subscription;

  // Options for form selects
  colorOptions = UrineTestEnumHelpers.getSelectOptionsWithEmpty(UrineColor);
  aspectOptions = UrineTestEnumHelpers.getSelectOptionsWithEmpty(UrineAspect);
  sedimentOptions = UrineTestEnumHelpers.getSelectOptionsWithEmpty(EscasaModeradaAbundanteAusenteQuantity);
  densityOptions = UrineTestEnumHelpers.getSelectOptionsWithEmpty(UrineDensity);
  phOptions = UrineTestEnumHelpers.getSelectOptionsWithEmpty(UrinePH);
  urobilinogenOptions = UrineTestEnumHelpers.getSelectOptionsWithEmpty(Urobilinogen);
  quantityOptions = UrineTestEnumHelpers.getSelectOptionsWithEmpty(EscasaModeradaAbundanteAusenteQuantity);
  yeastOptions = UrineTestEnumHelpers.getSelectOptionsWithEmpty(EscasaModeradaAbundanteAusenteQuantity);
  crystalTypeOptions = UrineTestEnumHelpers.getSelectOptionsWithEmpty(CrystalType);
  cylinderTypeOptions = UrineTestEnumHelpers.getSelectOptionsWithEmpty(CylinderType);
  
  // Enum reference for template
  TestStatus = TestStatus;
  negativePositive3PlusOptions = UrineTestEnumHelpers.getSelectOptionsWithEmpty(NegativePositive3Plus);
  negativePositive4PlusOptions = UrineTestEnumHelpers.getSelectOptionsWithEmpty(NegativePositive4Plus);
  negativePositiveOptions = UrineTestEnumHelpers.getSelectOptionsWithEmpty(NegativePositive);
  

  constructor(
    private fb: FormBuilder,
    private urineTestService: UrineTestService,
    private patientService: PatientService,
    private doctorService: DoctorService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.urineTestForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadPatients();
    this.loadDoctors();

    this.routeParamsSubscription = this.route.params.subscribe(params => {
      if (params['id']) {
        this.testId = params['id'];
        
        // Determinar si estamos en modo de edición o vista
        // Si la URL no incluye /edit, es modo de solo lectura
        const url = this.router.url;
        this.isEditMode = url.includes('/edit');
        this.readOnly = !url.includes('/edit');
        if (this.testId) {
          this.loadUrineTest(this.testId);
        }
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      patientId: ['', [Validators.required]],
      doctorId: [''],

      testDate: [this.getDefaultDateTime(), [Validators.required]],
      sampleNumber: [''],
      status: [TestStatus.PENDING],

      // Examen físico
      volume: [''],
      color: [this.DEFAULT_VALUES.color],
      aspect: [this.DEFAULT_VALUES.aspect],
      sediment: [this.DEFAULT_VALUES.sediment],

      // Examen químico
      density: [this.DEFAULT_VALUES.density],
      ph: [this.DEFAULT_VALUES.ph],
      protein: [this.DEFAULT_VALUES.protein],
      glucose: [this.DEFAULT_VALUES.glucose],
      bilirubin: [this.DEFAULT_VALUES.bilirubin],
      ketones: [this.DEFAULT_VALUES.ketones],
      occultBlood: [this.DEFAULT_VALUES.occultBlood],
      nitrites: [this.DEFAULT_VALUES.nitrites],
      urobilinogen: [this.DEFAULT_VALUES.urobilinogen],
      leukocytes: [this.DEFAULT_VALUES.leukocytes],

      // Examen microscópico
      epithelialCells: [this.DEFAULT_VALUES.epithelialCells],
      leukocytesField: [this.DEFAULT_VALUES.leukocytesField],
      erythrocytesField: [this.DEFAULT_VALUES.erythrocytesField],
      bacteria: [this.DEFAULT_VALUES.bacteria],
      mucousFilaments: [this.DEFAULT_VALUES.mucousFilaments],
      yeasts: [this.DEFAULT_VALUES.yeasts],
      crystals: this.fb.array([]),
      cylinders: this.fb.array([]),
      others: [''],

      // Información adicional
      observations: [''],
      // technician: ['']
    });
  }

  get crystals(): FormArray {
    return this.urineTestForm.get('crystals') as FormArray;
  }

  get cylinders(): FormArray {
    return this.urineTestForm.get('cylinders') as FormArray;
  }

  addCrystal(): void {
    this.crystals.push(this.fb.group({
      type: [''],
      quantity: ['']
    }));
  }

  removeCrystal(index: number): void {
    this.crystals.removeAt(index);
  }

  addCylinder(): void {
    this.cylinders.push(this.fb.group({
      type: [''],
      quantity: ['']
    }));
  }

  removeCylinder(index: number): void {
    this.cylinders.removeAt(index);
  }

  loadPatients(): void {
    this.patientService.getPatients(1, 1000).subscribe({
      next: (response) => {
        const patients = Array.isArray(response?.data) ? response.data : [];
        this.patients = patients.map(patient => ({
          id: patient.id || '',
          name: patient.name,
          age: patient.age,
          sex: patient.sex,
          email: patient.email,
          phone: patient.phone,
          dni: patient.dni,
          birthDate: patient.birthDate
        }));
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading patients:', error);
        this.error = 'Error al cargar la lista de pacientes';
      }
    });
  }

  loadDoctors(): void {
    this.loadingDoctors = true;
    this.doctorService.getDoctors(1, 1000).subscribe({
      next: (response) => {
        const doctors = Array.isArray(response?.data) ? response.data : [];
        this.doctors = doctors;
        this.loadingDoctors = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
        this.error = 'Error al cargar la lista de médicos';
        this.loadingDoctors = false;
      }
    });
  }

  loadUrineTest(id: string): void {
    this.loading = true;
    this.urineTestService.getUrineTestById(id).subscribe({
      next: (test) => {
        this.currentUrineTest = test;
        this.populateForm(test);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading urine test:', error);
        this.error = 'Error al cargar el examen de orina';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  populateForm(test: UrineTest): void {
    // Populate crystals array
    const crystalsArray = this.crystals;
    crystalsArray.clear();
    if (test.crystals && Array.isArray(test.crystals)) {
      test.crystals.forEach(crystal => {
        crystalsArray.push(this.fb.group({
          type: [crystal.type || ''],
          quantity: [crystal.quantity || '']
        }));
      });
    }

    // Populate cylinders array
    const cylindersArray = this.cylinders;
    cylindersArray.clear();
    if (test.cylinders && Array.isArray(test.cylinders)) {
      test.cylinders.forEach(cylinder => {
        cylindersArray.push(this.fb.group({
          type: [cylinder.type || ''],
          quantity: [cylinder.quantity || '']
        }));
      });
    }

    // Populate rest of the form
    this.urineTestForm.patchValue({
      patientId: test.patientId,
      doctorId: test.doctorId || '',
      testDate: this.formatDateForInput(test.testDate),
      sampleNumber: test.sampleNumber || '',
      status: test.status,

      // Examen físico
      volume: test.volume || '',
      color: test.color || '',
      aspect: test.aspect || '',
      sediment: test.sediment || '',

      // Examen químico
      density: test.density || '',
      ph: test.ph || '',
      protein: test.protein || '',
      glucose: test.glucose || '',
      bilirubin: test.bilirubin || '',
      ketones: test.ketones || '',
      occultBlood: test.occultBlood || '',
      nitrites: test.nitrites || '',
      urobilinogen: test.urobilinogen || '',
      leukocytes: test.leukocytes || '',

      // Examen microscópico
      epithelialCells: test.epithelialCells || '',
      leukocytesField: test.leukocytesField || '',
      erythrocytesField: test.erythrocytesField || '',
      bacteria: test.bacteria || '',
      mucousFilaments: test.mucousFilaments || '',
      yeasts: test.yeasts || '',
      others: test.others || '',

      // Información adicional
      observations: test.observations || '',
      createdById: test.createdById || ''
    });

    // Si estamos en modo solo lectura, deshabilitamos el formulario completo
    if (this.readOnly) {
      this.urineTestForm.disable();
    }
  }

  onSubmit(): void {
    if (this.urineTestForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.saving = true;
    this.error = null;

    const formData = this.prepareFormData();

    if (this.isEditMode && this.testId) {
      this.updateUrineTest(this.testId, formData as UpdateUrineTestDto);
    } else {
      this.createUrineTest(formData as CreateUrineTestDto);
    }
  }

  createUrineTest(data: CreateUrineTestDto): void {
    this.urineTestService.createUrineTest(data).subscribe({
      next: (result) => {
        this.successMessage = 'Examen de orina creado correctamente';
        this.saving = false;
        setTimeout(() => {
          this.router.navigate(['/urine-tests', result.id]);
        }, 2000);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error creating urine test:', error);
        this.error = error.message || 'Error al crear el examen';
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateUrineTest(id: string, data: UpdateUrineTestDto): void {
    this.urineTestService.updateUrineTest(id, data).subscribe({
      next: (result) => {
        this.successMessage = 'Examen de orina actualizado correctamente';
        this.saving = false;
        setTimeout(() => {
          this.router.navigate(['/urine-tests', result.id]);
        }, 2000);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error updating urine test:', error);
        this.error = error.message || 'Error al actualizar el examen';
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  saveAsDraft(): void {
    if (!this.urineTestForm.get('patientId')?.value) {
      this.error = 'Seleccione un paciente primero';
      return;
    }

    this.urineTestForm.patchValue({ status: TestStatus.PENDING });
    
    const draftData = this.prepareFormData();
    draftData.status = TestStatus.PENDING;
    
    this.saving = true;
    this.error = null;

    this.urineTestService.createUrineTest(draftData as CreateUrineTestDto).subscribe({
      next: (result) => {
        this.successMessage = 'Borrador guardado correctamente';
        this.saving = false;
        setTimeout(() => {
          this.router.navigate(['/urine-tests', result.id]);
        }, 2000);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error saving draft:', error);
        this.error = `Error al guardar borrador: ${error.message}`;
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  prepareFormData(): CreateUrineTestDto | UpdateUrineTestDto {
    const formValue = this.urineTestForm.value;
    const currentUser = this.authService.getCurrentUserValue();
    
    const cleanedData: Partial<CreateUrineTestDto | UpdateUrineTestDto> = {
      patientId: formValue.patientId,
      doctorId: formValue.doctorId || undefined,
      testDate: formValue.testDate,
      sampleNumber: formValue.sampleNumber || ''
    };
    
    // ✅ Agregar createdById cuando se está creando un nuevo registro (no en modo edición)
    if (!this.isEditMode && currentUser?.id) {
      cleanedData.createdById = currentUser.id; // UUID string del usuario que crea el examen
      
      // 🔍 LOG: Verificar el objeto que se envía
      console.log('📝 URINE TEST - Usuario autenticado:', {
        id: currentUser.id,
        idType: typeof currentUser.id,
        username: currentUser.username,
        email: currentUser.email,
        role: currentUser.role
      });
    }
    
    // ✅ Agregar reviewedById cuando se está actualizando un registro existente
    if (this.isEditMode && currentUser?.id) {
      (cleanedData as UpdateUrineTestDto).reviewedById = currentUser.id; // UUID string del usuario que revisa
    }
    
    // Optional fields - usando el operador de encadenamiento opcional para mayor seguridad
    if (formValue?.status) cleanedData.status = formValue.status;

    // Physical exam - usando el operador de encadenamiento opcional
    if (formValue?.volume) cleanedData.volume = formValue.volume;
    if (formValue?.color) cleanedData.color = formValue.color;
    if (formValue?.aspect) cleanedData.aspect = formValue.aspect;
    if (formValue?.sediment) cleanedData.sediment = formValue.sediment;

    // Chemical exam
    if (formValue.density) cleanedData.density = formValue.density;
    if (formValue.ph) cleanedData.ph = formValue.ph;
    if (formValue.protein) cleanedData.protein = formValue.protein;
    if (formValue.glucose) cleanedData.glucose = formValue.glucose;
    if (formValue.bilirubin) cleanedData.bilirubin = formValue.bilirubin;
    if (formValue.ketones) cleanedData.ketones = formValue.ketones;
    if (formValue.occultBlood) cleanedData.occultBlood = formValue.occultBlood;
    if (formValue.nitrites) cleanedData.nitrites = formValue.nitrites;
    if (formValue.urobilinogen) cleanedData.urobilinogen = formValue.urobilinogen;
    if (formValue.leukocytes) cleanedData.leukocytes = formValue.leukocytes;

    // Microscopic exam
    if (formValue.epithelialCells) cleanedData.epithelialCells = formValue.epithelialCells;
    if (formValue.leukocytesField) cleanedData.leukocytesField = formValue.leukocytesField;
    if (formValue.erythrocytesField) cleanedData.erythrocytesField = formValue.erythrocytesField;
    if (formValue.bacteria) cleanedData.bacteria = formValue.bacteria;
    if (formValue.mucousFilaments) cleanedData.mucousFilaments = formValue.mucousFilaments;
    if (formValue.yeasts) cleanedData.yeasts = formValue.yeasts;
    
    // Arrays - only send if not empty
    // Arrays - usando tipado más específico y verificaciones más seguras
    if (Array.isArray(formValue?.crystals) && formValue.crystals.length > 0) {
      const validCrystals = formValue.crystals
        .filter((c: { type: string; quantity: string }) => 
          c && typeof c.type === 'string' && typeof c.quantity === 'string' && 
          c.type.trim() && c.quantity.trim()
        );
      if (validCrystals.length > 0) {
        cleanedData.crystals = validCrystals;
      }
    }
    
    if (Array.isArray(formValue?.cylinders) && formValue.cylinders.length > 0) {
      const validCylinders = formValue.cylinders
        .filter((c: { type: string; quantity: string }) => 
          c && typeof c.type === 'string' && typeof c.quantity === 'string' && 
          c.type.trim() && c.quantity.trim()
        );
      if (validCylinders.length > 0) {
        cleanedData.cylinders = validCylinders;
      }
    }

    if (formValue.others && formValue.others.trim()) cleanedData.others = formValue.others;

    // Additional info
    if (formValue.observations && formValue.observations.trim()) cleanedData.observations = formValue.observations;
    // if (formValue.technician && formValue.technician.trim()) cleanedData.technician = formValue.technician;

    return cleanedData;
  }

  getDefaultDateTime(): string {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }

  formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  }

  markFormGroupTouched(): void {
    if (!this.urineTestForm) return;

    Object.values(this.urineTestForm.controls).forEach(control => {
      if (control instanceof FormGroup) {
        Object.values(control.controls).forEach(c => c.markAsTouched());
      } else if (control instanceof FormArray) {
        control.controls.forEach(c => c.markAsTouched());
      } else {
        control.markAsTouched();
      }
    });
  }

  openPatientModal(): void {
    this.patientModal.open();
  }

  onPatientCreated(newPatient: Patient): void {
    // Agregar el nuevo paciente a la lista
    const patientInfo: PatientInfo = {
      id: newPatient.id || '',
      name: newPatient.name,
      age: newPatient.age,
      sex: newPatient.sex,
      email: newPatient.email,
      phone: newPatient.phone,
      dni: newPatient.dni,
      birthDate: newPatient.birthDate
    };
    
    this.patients.push(patientInfo);
    
    // Ordenar la lista alfabéticamente por nombre
    this.patients.sort((a, b) => 
      a.name.localeCompare(b.name)
    );

    // Seleccionar automáticamente el nuevo paciente
    this.urineTestForm.patchValue({
      patientId: patientInfo.id
    });

    // Mostrar mensaje de éxito
    this.successMessage = `Paciente "${newPatient.name}" creado y seleccionado exitosamente`;
    
    // Limpiar mensaje después de 3 segundos
    setTimeout(() => {
      this.successMessage = null;
      this.cdr.detectChanges();
    }, 3000);
    
    this.cdr.detectChanges();
  }

  onModalClosed(): void {
    // Este método se llama cuando el modal se cierra sin crear un paciente
    // Puede dejarse vacío o agregar lógica adicional si es necesario
  }

  openDoctorModal(): void {
    this.doctorModal.openModal();
  }

  onDoctorCreated(newDoctor: Doctor): void {
    // Agregar el nuevo médico a la lista
    this.doctors.push(newDoctor);
    
    // Ordenar la lista alfabéticamente por apellido
    this.doctors.sort((a, b) => 
      a.lastName.localeCompare(b.lastName)
    );

    // Seleccionar automáticamente el nuevo médico
    this.urineTestForm.patchValue({
      doctorId: newDoctor.id
    });

    // Mostrar mensaje de éxito
    this.successMessage = `Médico "${newDoctor.firstName} ${newDoctor.lastName}" creado y seleccionado exitosamente`;
    
    // Limpiar mensaje después de 3 segundos
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
    
    this.cdr.detectChanges();
  }

  // Método para limpiar recursos al destruir el componente
  ngOnDestroy(): void {
    // Limpiar las suscripciones si existen
    if (this.routeParamsSubscription) {
      this.routeParamsSubscription.unsubscribe();
    }
  }
}
