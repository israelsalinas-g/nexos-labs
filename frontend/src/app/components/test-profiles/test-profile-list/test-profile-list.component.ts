import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TestProfile } from '../../../models/test-profile.interface';
import { TestProfileService } from '../../../services/test-profile.service';
import { TestSectionService } from '../../../services/test-section.service';
import { TestSection } from '../../../models/test-section.interface';
import { TestProfileFormComponent } from '../test-profile-form/test-profile-form.component';

@Component({
  selector: 'app-test-profile-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TestProfileFormComponent],
  templateUrl: './test-profile-list.component.html',
  styleUrls: ['./test-profile-list.component.css']
})
export class TestProfileListComponent implements OnInit {
  profiles: TestProfile[] = [];
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
  selectedProfile?: TestProfile;
  selectedProfileDetail: TestProfile | null = null;

  constructor(
    private profileService: TestProfileService,
    private categoryService: TestSectionService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProfiles();
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

  loadProfiles(): void {
    this.loading = true;
    this.error = null;

    this.profileService.getTestProfiles({
      page: this.currentPage,
      limit: this.itemsPerPage,
      search: this.searchTerm
    }).subscribe({
      next: (response) => {
        // Getter ensures profiles is always an array
        this.profiles = response.data;
        this.totalItems = response.total;
        this.totalPages = response.totalPages;
        this.currentPage = response.page;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || 'Error al cargar los perfiles';
        this.loading = false;
        console.error('Error loading profiles:', err);
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadProfiles();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadProfiles();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.categoryFilter = '';
    this.currentPage = 1;
    this.loadProfiles();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProfiles();
    }
  }

  openCreateModal(): void {
    this.selectedProfile = undefined;
    this.showFormModal = true;
  }

  openEditModal(profile: TestProfile): void {
    this.selectedProfile = profile;
    this.showFormModal = true;
  }

  onProfileSaved(profile: TestProfile): void {
    this.showFormModal = false;
    this.selectedProfile = undefined;
    this.loadProfiles();
  }

  onFormCancelled(): void {
    this.showFormModal = false;
    this.selectedProfile = undefined;
  }

  viewProfile(profile: TestProfile): void {
    this.selectedProfileDetail = profile;
  }

  closeDetailModal(): void {
    this.selectedProfileDetail = null;
  }

  deleteProfile(profile: TestProfile): void {
    if (confirm(`¿Está seguro que desea eliminar el perfil "${profile.name}"?`)) {
      this.profileService.deleteTestProfile(profile.id.toString()).subscribe({
        next: () => {
          this.loadProfiles();
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

  trackByProfileId(index: number, profile: TestProfile): any {
    return profile.id || index;
  }
}
