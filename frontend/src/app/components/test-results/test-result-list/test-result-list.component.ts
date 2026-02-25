import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TestResult } from '../../../models/test-result.interface';
import { TestResultService } from '../../../services/test-result.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PaginatedResponse } from '../../../models/paginated-response.interface';

@Component({
  selector: 'app-test-result-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './test-result-list.component.html',
  styleUrls: ['./test-result-list.component.css']
})
export class TestResultListComponent implements OnInit, OnDestroy {
  results: TestResult[] = [];
  loading = false;
  error: string | null = null;
  
  currentPage = 1;
  pageSize = 4;
  totalPages = 1;
  
  private destroy$ = new Subject<void>();

  constructor(
    private resultService: TestResultService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadResults();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadResults(): void {
    this.loading = true;
    this.error = null;

    this.resultService.getResults(this.currentPage, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PaginatedResponse<TestResult>) => {
          this.results = response.data;
          this.totalPages = response.totalPages;
          this.loading = false;
        },
        error: (err: any) => {
          this.error = 'Error cargando resultados. Por favor, intente de nuevo.';
          this.loading = false;
          console.error('Error loading results:', err);
        }
      });
  }

  navigateToCreate(): void {
    this.router.navigate(['/test-results/create']);
  }

  viewResult(result: TestResult): void {
    this.router.navigate(['/test-results', result.id]);
  }

  editResult(result: TestResult): void {
    this.router.navigate(['/test-results', result.id, 'edit']);
  }

  deleteResult(result: TestResult): void {
    if (confirm('¿Está seguro de que desea eliminar este resultado?')) {
      this.resultService.deleteResult(result.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadResults();
          },
          error: (err: any) => {
            console.error('Error deleting result:', err);
            this.error = 'Error al eliminar el resultado.';
          }
        });
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadResults();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadResults();
    }
  }

  trackByResultId(index: number, result: TestResult): number {
    return result.id;
  }

  formatStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'PENDING': 'Pendiente',
      'COMPLETED': 'Completado',
      'VERIFIED': 'Verificado',
      'REJECTED': 'Rechazado'
    };
    return statusMap[status] || status;
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace('_', '-');
  }
}
