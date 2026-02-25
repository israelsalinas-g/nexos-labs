import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DymindDh36Result, Parameter } from '../../../models/dymind-dh36-result.interface';
import { Patient } from '../../../models/patient.interface';
import { DymindDh36ResultService } from '../../../services/dymind-dh36-result.service';
import { PatientService } from '../../../services/patient.service';
import { PdfDymindDh36Service } from '../../../services/pdf/pdf-dymind-dh36.service';
import { PatientQuickCreateModalComponent } from '../../patient/patient-form/patient-quick-create-modal.component';

@Component({
  selector: 'app-dymind-dh36-results',
  standalone: true,
  imports: [CommonModule, FormsModule, PatientQuickCreateModalComponent],
  templateUrl: `./dymind-dh36-results.component.html`,
  styleUrls: [`./dymind-dh36-results.component.css`]
})
export class DymindDh36ResultsComponent implements OnInit {
  labResults: DymindDh36Result[] = [];
  originalLabResults: DymindDh36Result[] = [];
  paginatedResults: DymindDh36Result[] = [];
  loading = true;
  error: string | null = null;
  currentPage = 1;
  pageSize = 4;
  totalPages = 0;
  totalResults = 0;

  // Propiedades para filtrado
  patientSearchTerm: string = '';

  // Propiedades para edición
  showEditModal = false;
  editingResult: DymindDh36Result | null = null;
  saving = false;
  successMessage: string | null = null;

  // Assign Patient Modal
  showAssignPatientModal = false;
  searchPatientTerm = '';
  searchedPatients: Patient[] = [];
  selectedResultForAssignment: DymindDh36Result | null = null;
  isSearchingPatients = false;
  isAssigningPatient = false;

  // Quick Create Patient Modal
  showQuickCreatePatient = false;

  constructor(
    private dymindDh36ResultService: DymindDh36ResultService,
    private patientService: PatientService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private pdfService: PdfDymindDh36Service
  ) {}

  ngOnInit(): void {
    this.loadLabResults();
  }

  loadLabResults(): void {
    console.log('Loading lab results...');
    this.loading = true;
    this.error = null;
    
    const offset = (this.currentPage - 1) * this.pageSize;

    this.dymindDh36ResultService.getDymindDh36Results(this.pageSize, offset, this.patientSearchTerm).subscribe({
      next: (response) => {
        console.log('Lab results loaded successfully:', response);
        // Extraer array de datos paginados
        const results = Array.isArray(response?.data) ? response.data : [];
        console.log('Results length:', results.length);
        
        // Log para verificar datos del paciente
        results.forEach((result: any, index: number) => {
          console.log(`Result ${index}:`, {
            sampleNumber: result.sampleNumber,
            patientId: result.patientId,
            Patient: result.Patient,
            patientNameDymind: result.patientNameDymind
          });
        });
        
        this.paginatedResults = results;
        this.totalResults = response?.total || results.length;
        this.totalPages = Math.ceil(this.totalResults / this.pageSize);
        
        // Guardar en labResults para compatibilidad
        if (this.currentPage === 1) {
          this.labResults = results;
        }
        this.originalLabResults = [...results];
        
        console.log('this.paginatedResults:', this.paginatedResults);
        console.log('this.totalResults:', this.totalResults);
        console.log('this.totalPages:', this.totalPages);
        this.loading = false;
        console.log('Loading set to false');
        this.cdr.detectChanges(); // Force change detection
        console.log('Change detection triggered');
      },
      error: (err) => {
        console.error('Error loading lab results:', err);
        this.error = 'No se pudieron cargar los resultados del laboratorio. Verifica que el backend esté ejecutándose.';
        this.loading = false;
        this.cdr.detectChanges(); // Force change detection
      }
    });
  }

  applyFilters(): void {
    // Reset a la primera página cuando se aplican filtros
    this.currentPage = 1;
    this.loadLabResults();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadLabResults();
    }
  }

  getPaginationStart(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getPaginationEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalResults);
  }

  navigateToDetail(sampleNumber: string): void {
    console.log('Navigating to Dymind DH36 detail for sample number:', sampleNumber);
    this.router.navigate(['/dymind-dh36-result', sampleNumber]);
  }

  async generatePdf(sampleNumber: string, event: Event): Promise<void> {
    event.stopPropagation(); // Evita que se ejecute el click de la fila
    
    console.log('Generating PDF for sample number:', sampleNumber);
    
    this.dymindDh36ResultService.getDymindDh36ResultBySampleNumber(sampleNumber).subscribe({
      next: async (result) => {
        try {
          await this.pdfService.generatePdf(result);
        } catch (error) {
          console.error('Error generating Dymind DH36 PDF:', error);
          alert('Error al generar el PDF de Dymind DH36');
        }
      },
      error: (err) => {
        console.error('Error loading lab result for PDF:', err);
        alert('Error al cargar el resultado para generar el PDF');
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusClass(result: DymindDh36Result): string {
    if (!result.parameters || result.parameters.length === 0) {
      return 'status-normal';
    }
    const hasAbnormal = result.parameters.some((p: Parameter) => 
      p.status && (p.status.includes('H') || p.status.includes('L') || p.status.includes('A'))
    );
    return hasAbnormal ? 'status-abnormal' : 'status-normal';
  }

  getStatusText(result: DymindDh36Result): string {
    if (!result.parameters || result.parameters.length === 0) {
      return 'Sin parámetros';
    }
    const hasAbnormal = result.parameters.some((p: Parameter) => 
      p.status && (p.status.includes('H') || p.status.includes('L') || p.status.includes('A'))
    );
    return hasAbnormal ? 'Anormal' : 'Normal';
  }

  editLabResult(result: DymindDh36Result, event: Event): void {
    event.stopPropagation(); // Evita que se ejecute el click de la fila
    
    // Limpiar mensajes anteriores
    this.error = null;
    this.successMessage = null;
    
    // Crear una copia profunda del resultado para editar
    this.editingResult = JSON.parse(JSON.stringify(result));
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingResult = null;
    this.saving = false;
  }

  async saveLabResult(): Promise<void> {
    if (!this.editingResult) {
      return;
    }

    this.saving = true;

    try {
      console.log('=== DEBUG: Enviando al backend ===');
      console.log('ID:', this.editingResult.id);
      console.log('Datos completos:', this.editingResult);
      
      const updatedResult = await this.dymindDh36ResultService.updateDymindDh36Result(
        this.editingResult.id, 
        this.editingResult
      ).toPromise();

      console.log('=== DEBUG: Respuesta del backend ===');
      console.log('Resultado completo:', updatedResult);
      console.log('Parámetros recibidos:', updatedResult?.parameters);
      if (updatedResult?.parameters) {
        console.log('Primer parámetro ejemplo:', updatedResult.parameters[0]);
      }

      // Actualizar el resultado en la lista local
      const index = this.labResults.findIndex(r => r.id === this.editingResult!.id);
      if (index !== -1) {
        this.labResults[index] = updatedResult!;
        this.loadLabResults();
      }

      // Cerrar el modal
      this.closeEditModal();

      // Mostrar mensaje de éxito
      this.successMessage = 'Resultado de laboratorio actualizado correctamente';
      setTimeout(() => {
        this.successMessage = null;
      }, 5000);

    } catch (error: any) {
      console.error('Error updating lab result:', error);
      this.error = error.message || 'Error al actualizar el resultado de laboratorio. Inténtalo de nuevo.';
      this.saving = false;
    }
  }

  debugData(): void {
    if (!this.editingResult) return;
    
    console.log('=== DEBUG: Datos originales ===');
    console.log(JSON.stringify(this.editingResult, null, 2));
    
    // Usar la misma lógica de limpieza que el servicio
    const cleaned: any = { ...this.editingResult };
    
    // Remover campos que no deben ser actualizados
    delete cleaned.id;
    delete cleaned.createdAt;
    delete cleaned.updatedAt;
    delete cleaned.instrumentId;
    delete cleaned.rawData;
    delete cleaned.processingStatus;

    // Limpiar campos vacíos
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === '' || cleaned[key] === null || cleaned[key] === undefined) {
        delete cleaned[key];
      }
    });

    // Limpiar parámetros - solo enviar name y result
    if (cleaned.parameters && Array.isArray(cleaned.parameters)) {
      cleaned.parameters = cleaned.parameters.map((param: any) => ({
        name: param.name || '',
        result: param.result || ''
        // El backend recalculará automáticamente: status, unit, referenceRange
      }));
    }
    
    console.log('=== DEBUG: Datos que se enviarán ===');
    console.log(JSON.stringify(cleaned, null, 2));
    
    alert('Revisa la consola del navegador para ver los datos que se enviarán al backend');
  }

  deleteLabResult(id: number): void {
    if (!confirm('¿Estás seguro de que deseas eliminar este resultado de laboratorio?')) {
      return;
    }

    this.dymindDh36ResultService.deleteDymindDh36Result(id).subscribe({
      next: () => {
        // Eliminar del array local y recargar
        this.labResults = this.labResults.filter(r => r.id !== id);
        this.originalLabResults = this.originalLabResults.filter(r => r.id !== id);
        this.currentPage = 1;
        this.loadLabResults();
        
        // Mostrar mensaje de éxito
        this.successMessage = 'Resultado de laboratorio eliminado correctamente';
        setTimeout(() => {
          this.successMessage = null;
        }, 5000);
      },
      error: (err) => {
        console.error('Error al eliminar resultado:', err);
        this.error = err.message || 'Error al eliminar el resultado de laboratorio. Inténtalo de nuevo.';
      }
    });
  }

  // Métodos para el modal de asignación de paciente
  openAssignPatientModal(result: DymindDh36Result, event: Event): void {
    event.stopPropagation();
    this.selectedResultForAssignment = result;
    this.searchPatientTerm = '';
    this.searchedPatients = [];
    this.showAssignPatientModal = true;
    this.error = null;
  }

  searchPatients(): void {
    if (!this.searchPatientTerm || this.searchPatientTerm.trim().length < 2) {
      this.searchedPatients = [];
      return;
    }

    this.isSearchingPatients = true;
    this.error = null;

    // Usar getPatients con parámetro search para buscar por nombre
    this.patientService.getPatients(1, 50, this.searchPatientTerm.trim()).subscribe({
      next: (response) => {
        this.searchedPatients = response.data || [];
        this.isSearchingPatients = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error searching patients:', error);
        this.error = 'Error al buscar pacientes: ' + (error.message || 'Error desconocido');
        this.isSearchingPatients = false;
        this.searchedPatients = [];
        this.cdr.detectChanges();
      }
    });
  }

  assignPatientToResult(patient: Patient): void {
    if (!this.selectedResultForAssignment || !patient.id) {
      return;
    }

    this.isAssigningPatient = true;
    this.error = null;

    this.dymindDh36ResultService.assignPatientToDymindDh36Result(
      this.selectedResultForAssignment.id,
      patient.id
    ).subscribe({
      next: (updatedResult) => {
        // Actualizar el resultado en el array
        const index = this.paginatedResults.findIndex(r => r.id === updatedResult.id);
        if (index !== -1) {
          this.paginatedResults[index] = updatedResult;
        }

        this.isAssigningPatient = false;
        this.successMessage = `Paciente ${patient.name} asignado correctamente al resultado`;
        this.closeAssignPatientModal();
        
        // Recargar los datos
        this.loadLabResults();
        
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => {
          this.successMessage = null;
          this.cdr.detectChanges();
        }, 3000);

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error assigning patient:', error);
        this.error = 'Error al asignar paciente: ' + (error.message || 'Error desconocido');
        this.isAssigningPatient = false;
        this.cdr.detectChanges();
      }
    });
  }

  closeAssignPatientModal(): void {
    this.showAssignPatientModal = false;
    this.selectedResultForAssignment = null;
    this.searchPatientTerm = '';
    this.searchedPatients = [];
    this.isSearchingPatients = false;
    this.isAssigningPatient = false;
  }

  openCreateNewPatient(): void {
    // Cerrar el modal de asignación
    this.showAssignPatientModal = false;
    // Abrir el modal de creación rápida
    this.showQuickCreatePatient = true;
  }

  onPatientCreated(): void {
    this.showQuickCreatePatient = false;
    // Volver a abrir el modal de asignación si había uno seleccionado
    if (this.selectedResultForAssignment) {
      this.showAssignPatientModal = true;
      // Recargar la lista de pacientes
      this.searchPatients();
    }
    this.loadLabResults();
  }

  closeQuickCreateModal(): void {
    this.showQuickCreatePatient = false;
    // Volver a abrir el modal de asignación si había uno seleccionado
    if (this.selectedResultForAssignment) {
      this.showAssignPatientModal = true;
    }
  }

  getParameterStatusClass(status: string): string {
    if (!status) return 'status-unknown';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('normal') || statusLower === 'n') return 'status-normal';
    if (statusLower.includes('high') || statusLower.includes('h') || statusLower.includes('alto')) return 'status-high';
    if (statusLower.includes('low') || statusLower.includes('l') || statusLower.includes('bajo')) return 'status-low';
    if (statusLower.includes('critical') || statusLower.includes('critico') || statusLower.includes('crítico')) return 'status-critical';
    
    return 'status-unknown';
  }

  getParameterStatusText(status: string): string {
    if (!status) return 'Sin estado';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('normal') || statusLower === 'n') return 'Normal';
    if (statusLower.includes('high') || statusLower.includes('h') || statusLower.includes('alto')) return 'Alto';
    if (statusLower.includes('low') || statusLower.includes('l') || statusLower.includes('bajo')) return 'Bajo';
    if (statusLower.includes('critical') || statusLower.includes('critico') || statusLower.includes('crítico')) return 'Crítico';
    
    return status;
  }

  /**
   * Obtiene el nombre del paciente según disponibilidad
   * Si patientId está vacío, usa patientNameDymind, sino usa Patient.name
   */
  getPatientName(result: DymindDh36Result): string {
    if (!result.patientId || result.patientId.trim() === '') {
      return result.patientNameDymind || 'N/A';
    }
    if (result.patient) {
      return result.patient.name || 'N/A';
    }
    return 'N/A';
  }

  /**
   * Obtiene la edad del paciente según disponibilidad
   * Si patientId está vacío, usa patientAgeDymind, sino usa patient.age
   */
  getPatientAge(result: DymindDh36Result): number | null {
    if (!result.patientId || result.patientId.trim() === '') {
      return result.patientAgeDymind || null;
    }
    if (result.patient) {
      return result.patient.age || null;
    }
    return null;
  }

  /**
   * Obtiene el sexo del paciente según disponibilidad
   * Si patientId está vacío, usa patientSexDymind, sino usa patient.sex
   */
  getPatientSex(result: DymindDh36Result): string {
    if (!result.patientId || result.patientId.trim() === '') {
      return result.patientSexDymind || '';
    }
    if (result.patient) {
      return result.patient.sex || '';
    }
    return '';
  }
}
