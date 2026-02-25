import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TestSection } from '../../../models/test-section.interface';
import { TestSectionService } from '../../../services/test-section.service';
import { TestSectionFormComponent } from '../test-section-form/test-section-form.component';

@Component({
  selector: 'app-test-section-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TestSectionFormComponent],
  templateUrl: './test-section-list.component.html',
  styleUrls: ['./test-section-list.component.css']
})
export class TestSectionListComponent implements OnInit {
  sections: TestSection[] = [];
  loading = true;
  error: string | null = null;
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 4;
  totalItems = 0;
  totalPages = 0;
  
  // Modal de formulario
  showFormModal = false;
  selectedSection?: TestSection;

  constructor(private sectionService: TestSectionService) {}

  ngOnInit(): void {
    this.loadSections();
  }

  loadSections(): void {
    this.loading = true;
    this.error = null;

    this.sectionService.getTestSections({
      page: this.currentPage,
      limit: this.itemsPerPage,
      search: this.searchTerm
    }).subscribe({
      next: (response) => {
        this.sections = response.data;
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
    this.loadSections();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadSections();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadSections();
    }
  }

  openCreateModal(): void {
    this.selectedSection = undefined;
    this.showFormModal = true;
  }

  openEditModal(section: TestSection): void {
    this.selectedSection = section;
    this.showFormModal = true;
  }

  onSectionSaved(section: TestSection): void {
    this.showFormModal = false;
    this.selectedSection = undefined;
    this.loadSections();
  }

  onFormCancelled(): void {
    this.showFormModal = false;
    this.selectedSection = undefined;
  }

  deleteSection(section: TestSection): void {
    if (confirm(`¿Está seguro que desea eliminar la sección "${section.name}"?`)) {
      this.sectionService.deleteTestSection(section.id.toString()).subscribe({
        next: () => {
          this.loadSections();
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
