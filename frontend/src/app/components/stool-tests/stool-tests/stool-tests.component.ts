import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
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
  styleUrls: ['./stool-tests.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoolTestsComponent implements OnInit {
  private stoolTestService = inject(StoolTestService);
  private router = inject(Router);
  private pdfService = inject(PdfStoolTestService);
  private toastService = inject(ToastService);

  stoolTests = signal<StoolTest[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  // Modal de confirmación
  showConfirmModal = signal<boolean>(false);
  confirmAction = signal<ConfirmAction>({ title: '', message: '', action: () => { } });

  // Pagination
  currentPage = signal<number>(1);
  pageSize = signal<number>(4);
  totalTests = signal<number>(0);
  totalPages = signal<number>(0);

  // Filters
  filters = signal<StoolTestFilters>({});

  ngOnInit(): void {
    this.loadStoolTests();
  }

  loadStoolTests(): void {
    this.loading.set(true);
    this.error.set(null);

    this.stoolTestService.getStoolTests({
      page: this.currentPage(),
      limit: this.pageSize(),
      ...this.filters()
    }).subscribe({
      next: (response: PaginatedResponse<StoolTest>) => {
        this.stoolTests.set(response.data || []);
        this.totalTests.set(response.total || 0);
        this.totalPages.set(response.totalPages || 0);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message || 'Error al cargar los exámenes');
        this.stoolTests.set([]);
        this.totalTests.set(0);
        this.totalPages.set(0);
        this.loading.set(false);
      }
    });
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadStoolTests();
  }

  updateFilters(update: Partial<StoolTestFilters>): void {
    this.filters.update(prev => ({ ...prev, ...update }));
  }

  clearFilters(): void {
    this.filters.set({});
    this.currentPage.set(1);
    this.loadStoolTests();
  }

  refreshData(): void {
    this.loadStoolTests();
  }

  createNewTest(): void {
    if (this.loading()) return;
    this.router.navigate(['/stool-tests/new']);
  }

  viewTest(test: StoolTest, event?: Event): void {
    if (event) event.stopPropagation();
    this.router.navigate(['/stool-tests', test.id]);
  }

  editTest(test: StoolTest, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/stool-tests', test.id, 'edit']);
  }

  deleteTest(id: number): void {
    const test = this.stoolTests().find(t => t.id === id);
    if (!test) return;

    const isActivating = !test.isActive;

    this.confirmAction.set({
      title: isActivating ? 'Activar Examen Coprológico' : 'Desactivar Examen Coprológico',
      message: isActivating
        ? `¿Está seguro que desea activar este examen coprológico?`
        : `¿Está seguro que desea desactivar este examen coprológico?`,
      action: () => this.executeStatusToggle(test)
    });
    this.showConfirmModal.set(true);
  }

  executeStatusToggle(test: StoolTest): void {
    const serviceCall = test.isActive
      ? this.stoolTestService.deactivateStoolTest(test.id)
      : this.stoolTestService.activateStoolTest(test.id);

    const actionText = test.isActive ? 'desactivado' : 'activado';

    serviceCall.subscribe({
      next: () => {
        this.loadStoolTests();
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

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadStoolTests();
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-ES');
    } catch {
      return dateString;
    }
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
    const hasParasites = test.parasites && test.parasites.length > 0;
    const hasProtozoos = test.protozoos && test.protozoos.length > 0;

    return !!(hasParasites ||
      hasProtozoos ||
      test.leukocytes === EscasaModeradaAbundanteAusenteQuantity.ABUNDANTE ||
      test.erythrocytes === EscasaModeradaAbundanteAusenteQuantity.ABUNDANTE);
  }

  async generatePdf(test: StoolTest, event: Event): Promise<void> {
    event.stopPropagation();
    try {
      await this.pdfService.generateStoolReport(test);
    } catch (error) {
      this.toastService.error('Error al generar el reporte PDF');
    }
  }
}
