import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UrineTest, UrineTestFilters} from '../../../models/urine-test.interface';
import { ConfirmAction } from '../../../models/common.interface';
import { UrineTestService } from '../../../services/urine-test.service';
import { PdfUrineTestService } from '../../../services/pdf/pdf-urine-test.service';

@Component({
  selector: 'app-urine-test-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './urine-test-list.component.html',
  styleUrls: ['./urine-test-list.component.css']
})
export class UrineTestListComponent implements OnInit {
  urineTests: UrineTest[] = [];
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;
  pendingReviewCount = 0;

  // Modal de confirmación
  showConfirmModal = false;
  confirmAction: ConfirmAction = { title: '', message: '', action: () => {} };

  // Filtering and sorting
  filters: UrineTestFilters = {
    page: 1,
    limit: 20,
    isActive: true  // Solo mostrar exámenes activos por defecto
  };
  sortField = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Pagination
  currentPage = 1;
  pageSize = 4;
  totalItems = 0;
  totalPages = 1;

  // Options for selects
  statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'in_progress', label: 'En Progreso' },
    { value: 'completed', label: 'Completado' },
    { value: 'reviewed', label: 'Revisado' },
    { value: 'cancelled', label: 'Cancelado' }
  ];

  constructor(
    private urineTestService: UrineTestService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private pdfService: PdfUrineTestService
  ) {}

  ngOnInit(): void {
    this.loadUrineTests();
    this.loadPendingReviewCount();
  }

  loadUrineTests(): void {
    this.loading = true;
    this.error = null;

    const queryFilters = {
      ...this.filters,
      page: this.currentPage,
      limit: this.pageSize
    };

    this.urineTestService.getUrineTests(queryFilters).subscribe({
      next: (response) => {
        this.urineTests = response.data;
        this.totalItems = response.total;
        this.currentPage = response.page;
        this.totalPages = response.totalPages;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading urine tests:', error);
        this.error = error.message || 'Error desconocido al cargar los exámenes';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }


  loadPendingReviewCount(): void {
    this.urineTestService.getPendingReview().subscribe({
      next: (tests) => {
        this.pendingReviewCount = tests.length;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading pending review count:', error);
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadUrineTests();
  }

  clearFilters(): void {
    this.filters = {
      page: 1,
      limit: 20
    };
    this.currentPage = 1;
    this.loadUrineTests();
  }

  sort(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.urineTests.sort((a, b) => {
      let aValue = this.getNestedValue(a, field);
      let bValue = this.getNestedValue(b, field);

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
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadUrineTests();
    }
  }

  trackByTestId(index: number, test: UrineTest): string {
    return test.id;
  }

  // Helper methods
  getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((o, p) => o && o[p], obj);
  }

  hasPhysicalResults(test: UrineTest): boolean {
    return !!(test.color || test.aspect || test.volume || test.sediment);
  }

  hasChemicalResults(test: UrineTest): boolean {
    return !!(test.protein || test.glucose || test.bilirubin || test.urobilinogen || 
              test.nitrites || test.leukocytes || test.density || test.ph || 
              test.ketones || test.occultBlood);
  }

  hasMicroscopicResults(test: UrineTest): boolean {
    return !!(test.bacteria || test.epithelialCells || test.mucousFilaments || 
              test.yeasts || test.leukocytesField || test.erythrocytesField ||
              (test.crystals && test.crystals.length > 0) || 
              (test.cylinders && test.cylinders.length > 0));
  }

  hasAbnormalResults(test: UrineTest): boolean {
    return this.urineTestService.hasAbnormalResults(test);
  }

  getColorClass(color: string): string {
    return `color-${color.toLowerCase().replace(/\s+/g, '-')}`;
  }

  getResultClass(result: string): string {
    if (result === 'Negativo') return 'negative';
    if (result.includes('Positivo')) return 'positive';
    return '';
  }

  getBacteriaClass(bacteria: string): string {
    return bacteria === 'Abundante' ? 'bacteria-abundante' : '';
  }

  getStatusClass(status: string | undefined): string {
    return status ? status.replace('_', '-') : 'unknown';
  }

  getStatusText(status: string | undefined): string {
    if (!status) return 'Sin estado';
    
    const statusMap: {[key: string]: string} = {
      'pending': 'Pendiente',
      'in_progress': 'En Proceso',
      'completed': 'Completado',
      'reviewed': 'Revisado',
      'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Actions
  viewDetails(id: string): void {
    // Navega a la ruta de solo lectura
    this.router.navigate(['/urine-tests', id]);
  }

  editTest(id: string): void {
    // Navega a la ruta de edición
    this.router.navigate(['/urine-tests', id, 'edit']);
  }

  generateReport(id: string): void {
    // Buscar el test en la lista actual
    const test = this.urineTests.find(t => t.id === id);
    if (test) {
      try {
        this.pdfService.generateUrineReport(test);
        this.successMessage = 'PDF generado correctamente';
        setTimeout(() => this.successMessage = null, 3000);
      } catch (error) {
        console.error('Error generando PDF:', error);
        this.error = 'Error al generar el PDF. Por favor, intente nuevamente.';
        setTimeout(() => this.error = null, 3000);
      }
    } else {
      this.error = 'No se encontró el examen solicitado';
      setTimeout(() => this.error = null, 3000);
    }
  }

  markAsCompleted(id: string): void {
    this.urineTestService.markAsCompleted(id).subscribe({
      next: (updatedTest) => {
        const index = this.urineTests.findIndex(t => t.id === id);
        if (index !== -1) {
          this.urineTests[index] = updatedTest;
        }
        this.successMessage = 'Examen marcado como completado';
        setTimeout(() => this.successMessage = null, 3000);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error marking as completed:', error);
        this.error = 'Error al marcar como completado';
        setTimeout(() => this.error = null, 3000);
      }
    });
  }

  deleteTest(id: string): void {
    const test = this.urineTests.find(t => t.id === id);
    if (!test) return;
    
    // Determinar la acción según el estado actual
    const isActivating = !test.isActive;
    
    this.confirmAction = {
      title: isActivating ? 'Activar Examen de Orina' : 'Desactivar Examen de Orina',
      message: isActivating 
        ? `¿Está seguro que desea activar este examen de orina? El registro volverá a estar visible y disponible.`
        : `¿Está seguro que desea desactivar este examen de orina? Este registro se ocultará y dejará de estar disponible.`,
      action: () => this.executeDelete(test)
    };
    this.showConfirmModal = true;
  }

  executeDelete(test: UrineTest): void {
    console.log('Executing status toggle for test:', test.id, 'isActive:', test.isActive);
    
    // Determinar qué servicio llamar según el estado actual
    const serviceCall = test.isActive 
      ? this.urineTestService.deactivateUrineTest(test.id)
      : this.urineTestService.activateUrineTest(test.id);
    
    const actionText = test.isActive ? 'desactivado' : 'activado';
    
    serviceCall.subscribe({
      next: (updatedTest) => {
        console.log(`Test ${actionText} successfully:`, updatedTest);
        // Recargar la lista completa para asegurar que los datos estén sincronizados
        this.loadUrineTests();
        this.successMessage = `Examen ${actionText} correctamente`;
        setTimeout(() => this.successMessage = null, 3000);
        this.closeModal();
      },
      error: (error) => {
        console.error(`Error ${actionText.slice(0, -2)}ando test:`, error);
        console.error('Error message:', error.message);
        console.error('Full error:', error);
        this.error = error.message || `Error al ${actionText.slice(0, -2)}ar el examen`;
        setTimeout(() => this.error = null, 5000);
        this.closeModal();
      }
    });
  }
  closeModal(): void {
    this.showConfirmModal = false;
    this.confirmAction = { title: '', message: '', action: () => {} };
  }

  loadPendingReview(): void {
    this.filters.status = 'completed';
    this.applyFilters();
  }

  loadAbnormalResults(): void {
    this.filters.hasAbnormalResults = true;
    this.applyFilters();
  }

  refreshStatistics(): void {
    this.loadPendingReviewCount();
  }

  exportData(): void {
    // Aquí implementarías la lógica de exportación
    console.log('Exporting urine test data...');
    this.successMessage = 'Función de exportación en desarrollo';
    setTimeout(() => this.successMessage = null, 3000);
  }
}
