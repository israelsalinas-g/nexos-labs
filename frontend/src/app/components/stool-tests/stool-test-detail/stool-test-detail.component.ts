import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StoolTestService } from '../../../services/stool-test.service';
import { DoctorService } from '../../../services/doctor.service';
import { PdfStoolTestService } from '../../../services/pdf/pdf-stool-test.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { StoolTest, UpdateStoolTestDto } from '../../../models/stool-test.interface';
import { Doctor } from '../../../models/doctor.interface';
import { ParasiteResult } from '../../../models/stool-test.interfaces';
import { GenresLabels } from '../../../enums/genres.enums';
import { TestStatus } from '../../../enums/test-status.enums';


@Component({
  selector: 'app-stool-test-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stool-test-detail.component.html',
  styleUrls: ['./stool-test-detail.component.css']
})
export class StoolTestDetailComponent implements OnInit {
  stoolTest: StoolTest | null = null;
  loading = true;
  error: string | null = null;
  successMessage: string | null = null;
  isEditing = false;
  saving = false;
  loadingDoctors = false;
  
  doctors: Doctor[] = [];
  editForm: UpdateStoolTestDto = {
    color: '',
    consistency: '',
    shape: '',
    mucus: '',
    leukocytes: '',
    erythrocytes: '',
    parasites: [],
    observations: '',
    status: TestStatus.PENDING,
    doctorId: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private stoolTestService: StoolTestService,
    private doctorService: DoctorService,
    private pdfService: PdfStoolTestService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadStoolTest(parseInt(id));
      this.loadDoctors();
    } else {
      this.error = 'ID del examen no válido';
      this.loading = false;
    }
  }

  loadStoolTest(id: number): void {
    this.loading = true;
    this.error = null;
    
    this.stoolTestService.getStoolTestById(id).subscribe({
      next: (test: StoolTest) => {
        this.stoolTest = test;
        this.initEditForm();
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Error al cargar el examen';
        this.loading = false;
        console.error('Error loading stool test:', err);
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
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
        this.error = 'Error al cargar la lista de médicos';
        this.loadingDoctors = false;
      }
    });
  }

  initEditForm(): void {
    if (this.stoolTest) {
      this.editForm = {
        color: this.stoolTest.color,
        consistency: this.stoolTest.consistency,
        shape: this.stoolTest.shape,
        mucus: this.stoolTest.mucus,
        leukocytes: this.stoolTest.leukocytes,
        erythrocytes: this.stoolTest.erythrocytes,
        parasites: this.stoolTest.parasites,
        observations: this.stoolTest.observations || '',
        status: this.stoolTest.status,
        doctorId: this.stoolTest.doctorId || ''
      };
    }
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.initEditForm();
      this.successMessage = null;
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.initEditForm(); // Reset form
  }

  saveChanges(): void {
    if (!this.stoolTest) return;

    this.saving = true;
    const currentUser = this.authService.getCurrentUserValue();

    // Include reviewedById from authenticated user
    const updates: UpdateStoolTestDto = {
      color: this.editForm.color,
      consistency: this.editForm.consistency,
      shape: this.editForm.shape,
      mucus: this.editForm.mucus,
      leukocytes: this.editForm.leukocytes,
      erythrocytes: this.editForm.erythrocytes,
      parasites: this.editForm.parasites,
      protozoos: this.editForm.protozoos,
      observations: this.editForm.observations,
      status: this.editForm.status,
      doctorId: this.editForm.doctorId || undefined,
      reviewedById: currentUser?.id || undefined // UUID del usuario que revisa el examen
    };

    // 🔍 LOG: Verificar datos antes de enviar
    console.log('📝 DETALLE - Objeto UpdateStoolTestDto:', updates);
    console.log('📋 DETALLE - Médico asignado:', {
      doctorId: this.editForm.doctorId,
      doctorIdType: typeof this.editForm.doctorId
    });
    console.log('📋 DETALLE - Usuario que revisa:', {
      id: currentUser?.id,
      idType: typeof currentUser?.id,
      username: currentUser?.username,
      email: currentUser?.email,
      role: currentUser?.role
    });

    this.stoolTestService.updateStoolTest(this.stoolTest.id, updates).subscribe({
      next: (updatedTest: StoolTest) => {
        this.stoolTest = updatedTest;
        this.isEditing = false;
        this.saving = false;
        this.successMessage = 'Examen actualizado correctamente';
        setTimeout(() => {
          this.successMessage = null;
        }, 5000);
      },
      error: (err) => {
        this.saving = false;
        console.error('Error updating stool test:', err);
        this.toastService.notifyHttpError(err, 'Error al guardar los cambios');
      }
    });
  }

  async generateReport(): Promise<void> {
    if (!this.stoolTest) return;

    try {
      await this.pdfService.generateStoolReport(this.stoolTest);
      console.log('PDF generado exitosamente para:', this.stoolTest.sampleNumber);
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      this.toastService.error('Error al generar el reporte PDF');
    }
  }

  goBack(): void {
    this.router.navigate(['/stool-tests']);
  }

  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

   getSexLabel(sex: string): string {
      return GenresLabels[sex as keyof typeof GenresLabels] || sex;
    }
    
  getStatusText(status: string): string {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'completed': return 'Completado';
      case 'reviewed': return 'Revisado';
      default: return status;
    }
  }

  getMicroscopicClass(value: string): string {
    if (value === 'no se observa') return 'normal';
    if (value === 'abundante') return 'abnormal';
    return '';
  }

  getParasitesClass(parasites: ParasiteResult[] | undefined): string {
    if (!parasites || parasites.length === 0 || 
        (parasites.length === 1)) {
      return 'normal';
    }
    return 'abnormal';
  }

  getParasiteItemClass(type: string): string {
    const normalTypes = [
      'NO SE OBSERVAN EN ESTA MUESTRA',
      'NO SE OBSERVA EN ESTA MUESTRA',
      'No se observan',
      'N/A'
    ];
    
    if (normalTypes.includes(type)) {
      return 'normal';
    }
    return 'abnormal';
  }
}
