import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { TestDefinition } from '../../../models/test-definition.interface';
import { TestSection } from '../../../models/test-section.interface';
import { TestDefinitionService } from '../../../services/test-definition.service';
import { LaboratoryOrderService } from '../../../services/laboratory-order.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface OrderTest {
  testId: string;
  testName: string;
  selected: boolean;
}

@Component({
  selector: 'app-add-tests-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './add-tests-dialog.component.html',
  styleUrls: ['./add-tests-dialog.component.css']
})
export class AddTestsDialogComponent implements OnInit, OnDestroy {
  tests: TestDefinition[] = [];
  filteredTests: TestDefinition[] = [];
  sections: TestSection[] = [];
  
  searchTerm = '';
  sectionFilter = '';
  selectedTests: TestDefinition[] = [];
  
  loading = false;
  isSubmitting = false;
  error: string | null = null;
  submitError: string | null = null;
  submitSuccess: string | null = null;
  
  private destroy$ = new Subject<void>();
  private orderId: string | null = null;

  constructor(
    private testService: TestDefinitionService,
    private orderService: LaboratoryOrderService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.orderId = params['id'];
        this.loadTests();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTests(): void {
    this.loading = true;
    this.error = null;

    this.testService.getTestDefinitions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.tests = response.data;
          this.filteredTests = [...this.tests];
          this.loading = false;
        },
        error: (err: any) => {
          this.error = 'Error cargando pruebas. Por favor, intente de nuevo.';
          this.loading = false;
          console.error('Error loading tests:', err);
        }
      });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredTests = this.tests.filter(test => {
      const matchesSearch = !this.searchTerm || 
        test.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        test.code?.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesSearch;
    });
  }

  toggleTest(test: TestDefinition): void {
    const index = this.selectedTests.findIndex(t => t.id === test.id);
    if (index > -1) {
      this.selectedTests.splice(index, 1);
    } else {
      this.selectedTests.push(test);
    }
  }

  isTestSelected(testId: string): boolean {
    return this.selectedTests.some(t => t.id === testId);
  }

  addSelectedTests(): void {
    if (!this.orderId || this.selectedTests.length === 0) return;

    this.isSubmitting = true;
    this.submitError = null;
    this.submitSuccess = null;

    const tests = this.selectedTests.map(t => ({
      testDefinitionId: t.id
    }));

    this.orderService.addTestsToOrder(this.orderId, { tests })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.submitSuccess = 'Pruebas agregadas exitosamente';
          setTimeout(() => {
            this.router.navigate(['/laboratory-orders', this.orderId]);
          }, 1500);
        },
        error: (err: any) => {
          this.submitError = 'Error al agregar pruebas.';
          this.isSubmitting = false;
          console.error('Error adding tests:', err);
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/laboratory-orders', this.orderId]);
  }
}
