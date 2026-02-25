import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StoolTestService } from '../../../services/stool-test.service';
import { PdfStoolTestService } from '../../../services/pdf/pdf-stool-test.service';
import { ToastService } from '../../../services/toast.service';
import { StoolTest } from '../../../models/stool-test.interface';
import { StoolTestFilters } from '../../../models/stool-test.interfaces';
import { PaginatedResponse } from '../../../models/patient.interface';
import { ConfirmAction } from '../../../models/common.interface';
import { EscasaModeradaAbundanteAusenteQuantity } from '../../../enums/escasa-moderada-abundante-ausente.enums';

@Component({
  selector: 'app-stool-tests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stool-tests.component.html',
  styleUrls: ['./stool-tests.component.css']
})
export class StoolTestsComponent implements OnInit {
  stoolTests: StoolTest[] = [];
  loading = true;
  error: string | null = null;
  // Modal de confirmación (igual que en urine-test)
  showConfirmModal = false;
  confirmAction: ConfirmAction = { title: '', message: '', action: () => {} };
  
  // Pagination
  currentPage = 1;
  pageSize = 4;
  totalTests = 0;
  totalPages = 0;
  
  // Filters
  filters: StoolTestFilters = {};

  constructor(
    private stoolTestService: StoolTestService,
    private router: Router,
    private pdfService: PdfStoolTestService,
    private toastService: ToastService
  ) {
    // Asegurar que stoolTests siempre sea un array
    this.stoolTests = this.stoolTests || [];
  }

  ngOnInit(): void {
    this.loadStoolTests();
  }

  loadStoolTests(): void {
    this.loading = true;
    this.error = null;

    console.log('Loading stool tests with params:', {
      currentPage: this.currentPage,
      pageSize: this.pageSize,
      filters: this.filters
    });
    
    this.stoolTestService.getStoolTests({
      page: this.currentPage,
      limit: this.pageSize,
      ...this.filters
    }).subscribe({
      next: (response: PaginatedResponse<StoolTest>) => {
        console.log('Stool tests response:', response);
        this.stoolTests = response.data;
        this.totalTests = response.total;
        this.totalPages = response.totalPages || 0;
        this.loading = false;
        console.log('Processed stool tests:', {
          stoolTests: this.stoolTests,
          totalTests: this.totalTests,
          totalPages: this.totalPages
        });
      },
      error: (err: Error) => {
        this.error = err.message || 'Error al cargar los exámenes';
        this.stoolTests = []; // Asegurar que sea un array vacío en caso de error
        this.totalTests = 0;
        this.totalPages = 0;
        this.loading = false;
        console.error('Error loading stool tests:', err);
      }
    });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadStoolTests();
  }

  clearFilters(): void {
    this.filters = {};
    this.currentPage = 1;
    this.loadStoolTests();
  }

  refreshData(): void {
    this.loadStoolTests();
  }

  createNewTest(): void {
    // Evitar múltiples clics rápidos
    if (this.loading) return;
    
    this.router.navigate(['/stool-tests/new']);
  }

  viewTest(test: StoolTest, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(['/stool-tests', test.id]);
  }

  editTest(test: StoolTest, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/stool-tests', test.id, 'edit']);
  }

  deleteTest(id: number): void {
    const test = this.stoolTests.find(t => t.id === id);
    if (!test) return;
    
    // Determinar la acción según el estado actual
    const isActivating = !test.isActive;
    
    this.confirmAction = {
      title: isActivating ? 'Activar Examen Coprológico' : 'Desactivar Examen Coprológico',
      message: isActivating 
        ? `¿Está seguro que desea activar este examen coprológico? El registro volverá a estar visible y disponible.`
        : `¿Está seguro que desea desactivar este examen coprológico? Este registro se ocultará y dejará de estar disponible.`,
      action: () => this.executeDelete(test)
    };
    this.showConfirmModal = true;
  }

  executeDelete(test: StoolTest): void {
    console.log('Executing status toggle for test:', test.id, 'isActive:', test.isActive);
    
    // Determinar qué servicio llamar según el estado actual
    const serviceCall = test.isActive 
      ? this.stoolTestService.deactivateStoolTest(test.id)
      : this.stoolTestService.activateStoolTest(test.id);
    
    const actionText = test.isActive ? 'desactivado' : 'activado';
    
    serviceCall.subscribe({
      next: (updatedTest) => {
        console.log(`Test ${actionText} successfully:`, updatedTest);
        // Recargar la lista completa para asegurar que los datos estén sincronizados
        this.loadStoolTests();
        this.error = `Examen ${actionText} correctamente`;
        setTimeout(() => this.error = null, 3000);
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

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadStoolTests();
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'completed': return 'Completado';
      case 'reviewed': return 'Revisado';
      default: return status;
    }
  }

  hasAbnormalFindings(test: StoolTest): boolean {
    // Consideramos anormal si hay parásitos o protozoos detectados o presencia significativa de elementos microscópicos
    const hasParasites = test.parasites && test.parasites.length > 0;
    const hasProtozoos = test.protozoos && test.protozoos.length > 0;
    
    return (hasParasites || 
            hasProtozoos ||
            test.leukocytes === EscasaModeradaAbundanteAusenteQuantity.ABUNDANTE ||
            test.erythrocytes === EscasaModeradaAbundanteAusenteQuantity.ABUNDANTE);
  }

  async generatePdf(test: StoolTest, event: Event): Promise<void> {
    event.stopPropagation();
    console.log('Generando PDF para examen:', test.sampleNumber);
    
    try {
      await this.pdfService.generateStoolReport(test);
      console.log('PDF generado exitosamente para:', test.sampleNumber);
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      this.toastService.error('Error al generar el reporte PDF');
    }
  }
}
