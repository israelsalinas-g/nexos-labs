import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TestDefinition } from '../../../models/test-definition.interface';
import { TestDefinitionService } from '../../../services/test-definition.service';
import { TestSectionService } from '../../../services/test-section.service';
import { TestSection } from '../../../models/test-section.interface';
import { TestResultType, TEST_RESULT_TYPE_LABELS } from '../../../enums/test-result-type.enums';
import { TestDefinitionFormComponent } from '../test-definition-form/test-definition-form.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-test-definition-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TestDefinitionFormComponent],
  templateUrl: './test-definition-list.component.html',
  styleUrls: ['./test-definition-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestDefinitionListComponent implements OnInit {
  tests: TestDefinition[] = [];
  categories: TestSection[] = [];
  loading = true;
  error: string | null = null;
  searchTerm = '';
  categoryFilter = '';
  currentPage = 1;
  itemsPerPage = 4;
  totalItems = 0;
  totalPages = 0;
  
  showFormModal = false;
  selectedTest?: TestDefinition;
  selectedTestDetail: TestDefinition | null = null;

  constructor(
    private testService: TestDefinitionService,
    private categoryService: TestSectionService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Cargar categorías primero, luego las pruebas
    this.categoryService.getActiveTestSections().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.cdr.markForCheck();
        this.loadTests();
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        // Aún así cargar las pruebas aunque falle la carga de categorías
        this.loadTests();
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getActiveTestSections().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  loadTests(): void {
    this.loading = true;
    this.error = null;

    this.testService.getTestDefinitions({
      page: this.currentPage,
      limit: this.itemsPerPage,
      search: this.searchTerm,
      sectionId: this.categoryFilter || undefined
    }).subscribe({
      next: (response) => {
        // Getter ensures tests is always an array
        this.tests = response.data.map(test => this.enrichTestWithSection(test));
        this.totalItems = response.total;
        this.totalPages = response.totalPages;
        this.currentPage = response.page;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err.message || 'Error al cargar las pruebas';
        this.loading = false;
        console.error('Error loading tests:', err);
        this.cdr.markForCheck();
      }
    });
  }

  private enrichTestWithSection(test: TestDefinition): TestDefinition {
    // El backend retorna 'section' como objeto completo, pero el formulario necesita 'sectionId'
    // Extraer el ID de section y asignarlo a sectionId
    if (test.section && test.section.id && !test.sectionId) {
      test.sectionId = test.section.id;
      console.log('Asignado sectionId desde section.id:', { testId: test.id, sectionId: test.sectionId });
    }
    
    console.log('enrichTestWithSection result:', { id: test.id, name: test.name, sectionId: test.sectionId, sectionName: test.section?.name });
    
    return test;
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadTests();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadTests();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.categoryFilter = '';
    this.currentPage = 1;
    this.loadTests();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadTests();
    }
  }

  openCreateModal(): void {
    this.selectedTest = undefined;
    this.showFormModal = true;
  }

  openEditModal(test: TestDefinition): void {
    this.selectedTest = test;
    this.showFormModal = true;
  }

  onTestSaved(test: TestDefinition): void {
    this.showFormModal = false;
    this.selectedTest = undefined;
    this.loadTests();
  }

  onFormCancelled(): void {
    this.showFormModal = false;
    this.selectedTest = undefined;
  }

  viewTest(test: TestDefinition): void {
    this.selectedTestDetail = test;
  }

  closeDetailModal(): void {
    this.selectedTestDetail = null;
  }

  deleteTest(test: TestDefinition): void {
    if (confirm(`¿Está seguro que desea eliminar la prueba "${test.name}"?`)) {
      this.testService.deleteTestDefinition(test.id.toString()).subscribe({
        next: () => {
          this.loadTests();
        },
        error: (err) => {
          this.error = err.message;
          this.cdr.markForCheck();
        }
      });
    }
  }

  getTestTypeLabel(type: TestResultType): string {
    return TEST_RESULT_TYPE_LABELS[type] || type;
  }

  trackByTestId(index: number, test: TestDefinition): any {
    return test.id || index;
  }
}
