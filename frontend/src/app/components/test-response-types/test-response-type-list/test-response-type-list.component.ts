import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TestResponseType } from '../../../models/test-response-type.interface';
import { TestResponseTypeService } from '../../../services/test-response-type.service';
import { TestResponseTypeFormComponent } from '../test-response-type-form/test-response-type-form.component';

@Component({
  selector: 'app-test-response-type-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TestResponseTypeFormComponent],
  templateUrl: './test-response-type-list.component.html',
  styleUrls: ['./test-response-type-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestResponseTypeListComponent implements OnInit {
  responseTypes: TestResponseType[] = [];
  loading = true;
  error: string | null = null;
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;
  includeInactive = false;

  showFormModal = false;
  selectedType?: TestResponseType;

  constructor(private service: TestResponseTypeService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadTypes();
  }

  loadTypes(): void {
    this.loading = true;
    this.error = null;
    this.service.getAll({
      page: this.currentPage,
      limit: this.itemsPerPage,
      search: this.searchTerm || undefined,
      includeInactive: this.includeInactive,
    }).subscribe({
      next: (res) => {
        this.responseTypes = res.data;
        this.totalItems = res.total;
        this.totalPages = res.totalPages;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadTypes();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadTypes();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadTypes();
    }
  }

  openCreateModal(): void {
    this.selectedType = undefined;
    this.showFormModal = true;
  }

  openEditModal(type: TestResponseType): void {
    this.selectedType = type;
    this.showFormModal = true;
  }

  onSaved(): void {
    this.showFormModal = false;
    this.selectedType = undefined;
    this.loadTypes();
  }

  onCancelled(): void {
    this.showFormModal = false;
    this.selectedType = undefined;
  }

  toggleActive(type: TestResponseType): void {
    this.service.toggleActive(type.id).subscribe({
      next: () => this.loadTypes(),
      error: (err) => { this.error = err.message; this.cdr.markForCheck(); }
    });
  }

  deleteType(type: TestResponseType): void {
    if (type.isSystem) {
      alert('No se pueden eliminar los tipos del sistema. Desactívelo en su lugar.');
      return;
    }
    if (confirm(`¿Eliminar el tipo de respuesta "${type.name}"?`)) {
      this.service.delete(type.id).subscribe({
        next: () => this.loadTypes(),
        error: (err) => { this.error = err.message; this.cdr.markForCheck(); }
      });
    }
  }

  getInputTypeLabel(inputType: string): string {
    const labels: Record<string, string> = {
      numeric: 'Numérico',
      text: 'Texto libre',
      enum: 'Opciones',
    };
    return labels[inputType] ?? inputType;
  }

  getInputTypeBadgeClass(inputType: string): string {
    const classes: Record<string, string> = {
      numeric: 'badge-numeric',
      text: 'badge-text',
      enum: 'badge-enum',
    };
    return classes[inputType] ?? '';
  }
}
