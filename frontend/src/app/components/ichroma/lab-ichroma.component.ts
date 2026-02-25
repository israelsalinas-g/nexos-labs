import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IChromaResult, UpdateIChromaResultDto } from '../../models/ichroma-result.interface';
import { LabIchromaService } from '../../services/lab-ichroma.service';
import { PdfIchromaService } from '../../services/pdf/pdf-ichroma.service';
import { PatientQuickCreateModalComponent } from '../patient/patient-form/patient-quick-create-modal.component';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../models/patient.interface';

@Component({
  selector: 'app-lab-ichroma',
  standalone: true,
  imports: [CommonModule, FormsModule, PatientQuickCreateModalComponent],
  templateUrl: './lab-ichroma.component.html',
  styleUrls: ['./lab-ichroma.component.css']
})
export class LabIchromaComponent implements OnInit {
  ichromaResults: IChromaResult[] = [];
  filteredResults: IChromaResult[] = [];
  paginatedResults: IChromaResult[] = [];
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  // Filters
  selectedTestType = '';
  patientSearchTerm = '';
  selectedStatus = '';
  uniqueTestTypes: string[] = [];

  // Sorting
  sortField = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Pagination
  currentPage = 1;
  itemsPerPage = 4;
  totalPages = 1;
  totalResults = 0;
  // Edit Modal
  isEditModalOpen = false;
  isViewMode = false; // true cuando abrimos en modo lectura, false en modo edición
  editingResult: IChromaResult = {} as IChromaResult;
  isSaving = false;

  // Quick Create Patient Modal
  showQuickCreatePatient = false;

  // Assign Patient Modal
  showAssignPatientModal = false;
  searchPatientTerm = '';
  searchedPatients: Patient[] = [];
  selectedResultForAssignment: IChromaResult | null = null;
  isSearchingPatients = false;
  isAssigningPatient = false;

  constructor(
    private labIchromaService: LabIchromaService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private pdfService: PdfIchromaService,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.loadIChromaResults();
  }

  loadIChromaResults(): void {
    this.loading = true;
    this.error = null;

    const offset = (this.currentPage - 1) * this.itemsPerPage;

    this.labIchromaService.getIChromaResults(this.itemsPerPage, offset, this.patientSearchTerm).subscribe({
      next: (response) => {
        // Extraer array de datos paginados y metadatos
        const results = Array.isArray(response?.data) ? response.data : [];
        this.paginatedResults = results;
        this.totalResults = response?.total || results.length;
        this.totalPages = Math.ceil(this.totalResults / this.itemsPerPage);
        
        // Combinar con resultados anteriores para el filtro local
        if (this.currentPage === 1) {
          this.ichromaResults = results;
        }
        
        this.extractUniqueTestTypes();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading iChroma results:', error);
        this.error = error.message || 'Error desconocido al cargar los resultados';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }



  extractUniqueTestTypes(): void {
    const testTypes = new Set(this.ichromaResults.map(result => result.testType));
    this.uniqueTestTypes = Array.from(testTypes).sort();
  }

  applyFilters(): void {
    // Los filtros se aplicarían en el servidor en una implementación completa
    // Por ahora, resetear a la primera página
    this.currentPage = 1;
    this.loadIChromaResults();
  }

  clearFilters(): void {
    this.selectedTestType = '';
    this.patientSearchTerm = '';
    this.selectedStatus = '';
    this.applyFilters();
  }

  sort(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.filteredResults.sort((a, b) => {
      let aValue = a[field as keyof IChromaResult];
      let bValue = b[field as keyof IChromaResult];

      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.updatePaginatedResults();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadIChromaResults();
    }
  }

  updatePaginatedResults(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedResults = this.filteredResults.slice(startIndex, endIndex);
  }

  trackByResultId(index: number, result: IChromaResult): number {
    return result.id;
  }

  isAbnormalResult(result: IChromaResult): boolean {
    if (result.referenceMin === null || result.referenceMax === null) {
      return false;
    }

    const numericResult = parseFloat(result.result);
    if (isNaN(numericResult)) {
      return false;
    }

    return numericResult < result.referenceMin || numericResult > result.referenceMax;
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'completed': return 'completed';
      case 'pending': return 'pending';
      case 'in_progress': return 'in-progress';
      case 'failed': return 'failed';
      default: return 'pending';
    }
  }

  getStatusText(status: string): string {
    switch (status?.toLowerCase()) {
      case 'completed': return 'Completado';
      case 'pending': return 'Pendiente';
      case 'in_progress': return 'En Proceso';
      case 'failed': return 'Fallido';
      default: return 'Desconocido';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  generatePdf(result: IChromaResult): void {
    try {
      this.pdfService.generatePdf(result);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF. Por favor, intente nuevamente.');
    }
  }

  editResult(result: IChromaResult): void {
    this.editingResult = { ...result };
    
    // Si patientId está vacío, asegurarse de que usamos los valores Ichroma2
    if (!result.patientId || result.patientId.trim() === '') {
      this.editingResult.patientNameIchroma2 = result.patientNameIchroma2 || '';
      this.editingResult.patientAgeIchroma2 = result.patientAgeIchroma2 || null;
      this.editingResult.patientSexIchroma2 = result.patientSexIchroma2 || '';
    } else {
      // Si patientId existe, llenar con los datos del patient si es posible
      if (result.patient) {
        this.editingResult.patientNameIchroma2 = result.patient.name || '';
        this.editingResult.patientAgeIchroma2 = result.patient.age || null;
        this.editingResult.patientSexIchroma2 = result.patient.sex || '';
      }
    }
    
    this.isViewMode = false; // Modo edición
    this.isEditModalOpen = true;
  }

  closeEditModal(): void {
    this.isEditModalOpen = false;
    this.isViewMode = false;
    this.editingResult = {} as IChromaResult;
    this.successMessage = null;
  }

  saveEdit(): void {
    if (!this.editingResult.id) return;

    this.isSaving = true;
    this.error = null;

    const updateData: UpdateIChromaResultDto = {
      patientIdIchroma2: this.editingResult.patientIdIchroma2,
      patientNameIchroma2: this.editingResult.patientNameIchroma2,
      patientAgeIchroma2: this.editingResult.patientAgeIchroma2 ?? undefined,
      patientSexIchroma2: this.editingResult.patientSexIchroma2 ?? undefined,
      testType: this.editingResult.testType,
      testName: this.editingResult.testName,
      result: this.editingResult.result,
      unit: this.editingResult.unit,
      referenceMin: this.editingResult.referenceMin ?? undefined,
      referenceMax: this.editingResult.referenceMax ?? undefined,
      processingStatus: this.editingResult.processingStatus,
      technicalNotes: this.editingResult.technicalNotes ?? undefined
    };

    this.labIchromaService.updateIChromaResult(this.editingResult.id, updateData).subscribe({
      next: (updatedResult) => {
        // Update the result in our arrays
        const index = this.ichromaResults.findIndex(r => r.id === updatedResult.id);
        if (index !== -1) {
          this.ichromaResults[index] = updatedResult;
        }

        this.applyFilters();
        this.isSaving = false;
        this.successMessage = 'Resultado actualizado correctamente';
        this.closeEditModal();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = null;
          this.cdr.detectChanges();
        }, 3000);

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error updating result:', error);
        this.error = error.message || 'Error al actualizar el resultado';
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }

  viewResult(result: IChromaResult): void {
    // Abrir modal en modo lectura (solo visualización)
    this.editingResult = { ...result };
    
    // Si patientId está vacío, asegurarse de que usamos los valores Ichroma2
    if (!result.patientId || result.patientId.trim() === '') {
      this.editingResult.patientNameIchroma2 = result.patientNameIchroma2 || '';
      this.editingResult.patientAgeIchroma2 = result.patientAgeIchroma2 || null;
      this.editingResult.patientSexIchroma2 = result.patientSexIchroma2 || '';
    } else {
      // Si patientId existe, llenar con los datos del patient si es posible
      if (result.patient) {
        this.editingResult.patientNameIchroma2 = result.patient.name || '';
        this.editingResult.patientAgeIchroma2 = result.patient.age || null;
        this.editingResult.patientSexIchroma2 = result.patient.sex || '';
      }
    }
    
    this.isViewMode = true; // Modo lectura
    this.isEditModalOpen = true;
  }

  /**
   * Obtiene el nombre del paciente según disponibilidad
   * Si patientId está vacío, usa patientNameIchroma2, sino usa patient.name
   */
  getPatientName(result: IChromaResult): string {
    if (!result.patientId || result.patientId.trim() === '') {
      return result.patientNameIchroma2 || 'N/A';
    }
    if (result.patient) {
      return result.patient.name || 'N/A';
    }
    return 'N/A';
  }

  /**
   * Obtiene la edad del paciente según disponibilidad
   * Si patientId está vacío, usa patientAgeIchroma2, sino usa patient.age
   */
  getPatientAge(result: IChromaResult): number | null {
    if (!result.patientId || result.patientId.trim() === '') {
      return result.patientAgeIchroma2 || null;
    }
    if (result.patient) {
      return result.patient.age || null;
    }
    return null;
  }

  /**
   * Obtiene el sexo del paciente según disponibilidad
   * Si patientId está vacío, usa patientSexIchroma2, sino usa patient.sex
   */
  getPatientSex(result: IChromaResult): string {
    if (!result.patientId || result.patientId.trim() === '') {
      return result.patientSexIchroma2 || '';
    }
    if (result.patient) {
      return result.patient.sex || '';
    }
    return '';
  }

  deleteResult(id: number): void {
    if (!confirm('¿Estás seguro de que deseas eliminar este resultado?')) {
      return;
    }

    this.labIchromaService.deleteIChromaResult(id).subscribe({
      next: () => {
        // Eliminar del array local
        this.ichromaResults = this.ichromaResults.filter(r => r.id !== id);
        this.applyFilters();
        
        // Mostrar mensaje de éxito
        this.successMessage = 'Resultado de iChroma eliminado correctamente';
        setTimeout(() => {
          this.successMessage = null;
        }, 5000);
      },
      error: (err: any) => {
        console.error('Error al eliminar resultado:', err);
        this.error = err.message || 'Error al eliminar el resultado de iChroma. Inténtalo de nuevo.';
      }
    });
  }

  // Métodos para el modal de asignación de paciente
  openAssignPatientModal(result: IChromaResult, event: Event): void {
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

    this.labIchromaService.assignPatientToIChromaResult(
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
        this.loadIChromaResults();
        
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
    this.loadIChromaResults();
  }

  closeQuickCreateModal(): void {
    this.showQuickCreatePatient = false;
    // Volver a abrir el modal de asignación si había uno seleccionado
    if (this.selectedResultForAssignment) {
      this.showAssignPatientModal = true;
    }
  }
}
