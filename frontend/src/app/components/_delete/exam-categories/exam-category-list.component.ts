import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExamCategory } from '../../../models/exam-category.interface';
import { ExamCategoryService } from '../../../services/exam-category.service';
import { ExamCategoryFormComponent } from './exam-category-form.component';

@Component({
  selector: 'app-exam-category-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ExamCategoryFormComponent],
  template: `
    <div class="container">
      <div class="header">
        <h1>Categorías de Exámenes</h1>
        <div class="search-controls">
          <input 
            type="text" 
            placeholder="Buscar categoría..." 
            [(ngModel)]="searchTerm"
            (input)="onSearch()"
            class="search-input">
          <button class="btn-secondary" (click)="clearSearch()">Limpiar</button>
        </div>
        <button class="btn-primary" (click)="openCreateModal()">
          + Nueva Categoría
        </button>
      </div>

      <div *ngIf="loading" class="loading">Cargando categorías...</div>
      <div *ngIf="error" class="error">{{ error }}</div>

      <div *ngIf="!loading && !error" class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Fecha Creación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let category of categories">
              <td>{{ category.name }}</td>
              <td>{{ category.description || 'Sin descripción' }}</td>
              <td>
                <span class="status-badge" [class.active]="category.isActive">
                  {{ category.isActive ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td>{{ formatDate(category.createdAt) }}</td>
              <td class="actions">
                <button class="btn-small btn-warning" (click)="openEditModal(category)">Editar</button>
                <button class="btn-small btn-danger" (click)="deleteCategory(category)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="pagination" *ngIf="totalPages > 1">
          <button class="btn-pagination" (click)="goToPage(currentPage - 1)" [disabled]="currentPage <= 1">
            ← Anterior
          </button>
          <span class="page-info">Página {{ currentPage }} de {{ totalPages }}</span>
          <button class="btn-pagination" (click)="goToPage(currentPage + 1)" [disabled]="currentPage >= totalPages">
            Siguiente →
          </button>
        </div>

        <div *ngIf="categories.length === 0" class="no-data">
          <p>No hay categorías registradas.</p>
        </div>
      </div>

      <!-- Modal de formulario -->
      <app-exam-category-form
        *ngIf="showFormModal"
        [category]="selectedCategory"
        (saved)="onCategorySaved($event)"
        (cancelled)="onFormCancelled()">
      </app-exam-category-form>
    </div>
  `,
  styles: [`
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 15px; flex-wrap: wrap; }
    .header h1 { color: #2c3e50; margin: 0; }
    .search-controls { display: flex; gap: 10px; }
    .search-input { padding: 8px; border: 1px solid #ddd; border-radius: 4px; width: 300px; }
    .loading, .error { text-align: center; padding: 40px; }
    .error { color: #e74c3c; background-color: #fadbd8; border-radius: 4px; }
    .table-container { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { background-color: #34495e; color: white; padding: 12px; text-align: left; }
    .data-table td { padding: 12px; border-bottom: 1px solid #ecf0f1; }
    .data-table tr:hover { background-color: #f8f9fa; }
    .status-badge { padding: 4px 8px; border-radius: 12px; font-size: 12px; }
    .status-badge.active { background-color: #d4edda; color: #155724; }
    .status-badge:not(.active) { background-color: #f8d7da; color: #721c24; }
    .actions { display: flex; gap: 5px; }
    .btn-primary { background-color: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
    .btn-secondary { background-color: #95a5a6; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
    .btn-small { padding: 4px 8px; border: none; border-radius: 3px; cursor: pointer; font-size: 12px; color: white; }
    .btn-warning { background-color: #ffc107; color: #212529; }
    .btn-danger { background-color: #dc3545; }
    .pagination { display: flex; justify-content: space-between; padding: 20px; background-color: #f8f9fa; }
    .btn-pagination { padding: 8px 16px; border: 1px solid #ddd; background-color: white; cursor: pointer; border-radius: 4px; }
    .btn-pagination:disabled { opacity: 0.5; cursor: not-allowed; }
    .no-data { padding: 40px; text-align: center; color: #6c757d; }
  `]
})
export class ExamCategoryListComponent implements OnInit {
  categories: ExamCategory[] = [];
  loading = true;
  error: string | null = null;
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 4;
  totalItems = 0;
  totalPages = 0;
  
  // Modal de formulario
  showFormModal = false;
  selectedCategory?: ExamCategory;

  constructor(private categoryService: ExamCategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.error = null;

    this.categoryService.getExamCategories({
      page: this.currentPage,
      limit: this.itemsPerPage,
      search: this.searchTerm
    }).subscribe({
      next: (response) => {
        this.categories = response.data;
        this.totalItems = response.total;
        this.totalPages = response.totalPages;
        this.currentPage = response.page;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadCategories();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadCategories();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadCategories();
    }
  }

  openCreateModal(): void {
    this.selectedCategory = undefined;
    this.showFormModal = true;
  }

  openEditModal(category: ExamCategory): void {
    this.selectedCategory = category;
    this.showFormModal = true;
  }

  onCategorySaved(category: ExamCategory): void {
    this.showFormModal = false;
    this.selectedCategory = undefined;
    this.loadCategories();
  }

  onFormCancelled(): void {
    this.showFormModal = false;
    this.selectedCategory = undefined;
  }

  deleteCategory(category: ExamCategory): void {
    if (confirm(`¿Está seguro que desea eliminar la categoría "${category.name}"?`)) {
      this.categoryService.deleteExamCategory(category.id.toString()).subscribe({
        next: () => {
          this.loadCategories();
        },
        error: (err) => {
          this.error = err.message;
        }
      });
    }
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('es-ES');
  }
}
