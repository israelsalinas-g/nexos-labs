import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { UrineTest, UrineTestFilters } from '../../../models/urine-test.interface';
import { ConfirmAction } from '../../../models/common.interface';
import { UrineTestService } from '../../../services/urine-test.service';
import { PdfUrineTestService } from '../../../services/pdf/pdf-urine-test.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-urine-test-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './urine-test-list.component.html',
  styleUrls: ['./urine-test-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UrineTestListComponent implements OnInit {
  private urineTestService = inject(UrineTestService);
  private router = inject(Router);
  private pdfService = inject(PdfUrineTestService);
  private toastService = inject(ToastService);

  urineTests = signal<UrineTest[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  pendingReviewCount = signal<number>(0);

  // Modal de confirmación
  showConfirmModal = signal<boolean>(false);
  confirmAction = signal<ConfirmAction>({ title: '', message: '', action: () => { } });

  // Filtering and sorting
  filters = signal<UrineTestFilters>({
    page: 1,
    limit: 20,
    isActive: true
  });
  sortField = signal<string>('');
  sortDirection = signal<'asc' | 'desc'>('asc');

  // Pagination
  currentPage = signal<number>(1);
  pageSize = signal<number>(4);
  totalItems = signal<number>(0);
  totalPages = signal<number>(1);

  // Options for selects
  statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'in_progress', label: 'En Progreso' },
    { value: 'completed', label: 'Completado' },
    { value: 'reviewed', label: 'Revisado' },
    { value: 'cancelled', label: 'Cancelado' }
  ];

  ngOnInit(): void {
    this.loadUrineTests();
    this.loadPendingReviewCount();
  }

  loadUrineTests(): void {
    this.loading.set(true);
    this.error.set(null);

    const queryFilters = {
      ...this.filters(),
      page: this.currentPage(),
      limit: this.pageSize()
    };

    this.urineTestService.getUrineTests(queryFilters).subscribe({
      next: (response) => {
        this.urineTests.set(response.data || []);
        this.totalItems.set(response.total || 0);
        this.totalPages.set(response.totalPages || 1);
        this.loading.set(false);
      },
      error: (error) => {
        this.error.set(error.message || 'Error desconocido al cargar los exámenes');
        this.loading.set(false);
      }
    });
  }

  loadPendingReviewCount(): void {
    this.urineTestService.getPendingReview().subscribe({
      next: (tests) => this.pendingReviewCount.set(tests.length),
      error: (error) => console.error('Error loading pending review count:', error)
    });
  }

  applyFilters(): void {
    this.currentPage.set(1);
    this.loadUrineTests();
  }

  clearFilters(): void {
    this.filters.set({
      page: 1,
      limit: 20,
      isActive: true
    });
    this.currentPage.set(1);
    this.loadUrineTests();
  }

  updateFilters(field: string, value: any): void {
    this.filters.set({
      ...this.filters(),
      [field]: value
    });
  }

  sort(field: string): void {
    if (this.sortField() === field) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }

    const sortedTests = [...this.urineTests()].sort((a, b) => {
      let aValue = this.getNestedValue(a, field);
      let bValue = this.getNestedValue(b, field);

      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return this.sortDirection() === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection() === 'asc' ? 1 : -1;
      return 0;
    });

    this.urineTests.set(sortedTests);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadUrineTests();
    }
  }

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
    const statusMap: { [key: string]: string } = {
      'pending': 'Pendiente',
      'in_progress': 'En Proceso',
      'completed': 'Completado',
      'reviewed': 'Revisado',
      'cancelled': 'Cancelado'
    };
    return statusMap[status] || status;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  }

  viewDetails(id: string): void {
    this.router.navigate(['/urine-tests', id]);
  }

  editTest(id: string): void {
    this.router.navigate(['/urine-tests', id, 'edit']);
  }

  generateReport(id: string): void {
    const test = this.urineTests().find(t => t.id === id);
    if (test) {
      try {
        this.pdfService.generateUrineReport(test);
        this.toastService.success('PDF generado correctamente');
      } catch (error) {
        this.toastService.error('Error al generar el PDF');
      }
    }
  }

  markAsCompleted(id: string): void {
    this.urineTestService.markAsCompleted(id).subscribe({
      next: () => {
        this.loadUrineTests();
        this.toastService.success('Examen marcado como completado');
      },
      error: () => this.toastService.error('Error al marcar como completado')
    });
  }

  deleteTest(id: string): void {
    const test = this.urineTests().find(t => t.id === id);
    if (!test) return;

    const isActivating = !test.isActive;

    this.confirmAction.set({
      title: isActivating ? 'Activar Examen' : 'Desactivar Examen',
      message: isActivating
        ? `¿Está seguro que desea activar este examen de orina?`
        : `¿Está seguro que desea desactivar este examen de orina?`,
      action: () => this.executeStatusToggle(test)
    });
    this.showConfirmModal.set(true);
  }

  executeStatusToggle(test: UrineTest): void {
    const serviceCall = test.isActive
      ? this.urineTestService.deactivateUrineTest(test.id)
      : this.urineTestService.activateUrineTest(test.id);

    const actionText = test.isActive ? 'desactivado' : 'activado';

    serviceCall.subscribe({
      next: () => {
        this.loadUrineTests();
        this.toastService.success(`Examen ${actionText} correctamente`);
        this.closeModal();
      },
      error: (error) => {
        this.error.set(error.message || `Error al ${actionText.slice(0, -2)}ar el examen`);
        this.closeModal();
      }
    });
  }

  closeModal(): void {
    this.showConfirmModal.set(false);
    this.confirmAction.set({ title: '', message: '', action: () => { } });
  }

  loadPendingReview(): void {
    this.filters.set({ ...this.filters(), status: 'completed' });
    this.applyFilters();
  }

  loadAbnormalResults(): void {
    this.filters.set({ ...this.filters(), hasAbnormalResults: true });
    this.applyFilters();
  }

  refreshStatistics(): void {
    this.loadPendingReviewCount();
  }

  exportData(): void {
    this.toastService.info('Función de exportación en desarrollo');
  }
}
