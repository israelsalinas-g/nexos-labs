import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Doctor, CreateDoctorRequest, UpdateDoctorRequest } from '../../../models/doctor.interface';
import { ConfirmAction } from '../../../models/common.interface';
import { DoctorService } from '../../../services/doctor.service';

@Component({
  selector: 'app-doctor-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor-list.component.html',
  styleUrls: ['./doctor-list.component.css']
})
export class DoctorListComponent implements OnInit {
  doctors: Doctor[] = [];
  loading = true;
  error: string | null = null;

  // Búsqueda y filtros
  searchTerm = '';
  statusFilter = '';

  // Paginación del backend
  currentPage = 1;
  itemsPerPage = 4;
  totalItems = 0;
  totalPages = 0;

  // Para usar en el template
  Math = Math;

  // Modal
  showConfirmModal = false;
  confirmAction: ConfirmAction = { title: '', message: '', action: () => {} };
  selectedDoctor: Doctor | null = null;

  // Form modal
  showFormModal = false;
  isEditMode = false;
  saving = false;
  formError: string | null = null;
  formData: (CreateDoctorRequest & { id?: string }) = this.getEmptyFormData();

  constructor(private doctorService: DoctorService) {}

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.loading = true;
    this.error = null;

    this.doctorService.getDoctors(this.currentPage, this.itemsPerPage, this.searchTerm).subscribe({
      next: (response) => {
        console.log('Response from backend:', response);
        
        this.doctors = Array.isArray(response.data) ? response.data : [];
        this.totalItems = response.total || 0;
        this.totalPages = response.totalPages || 0;
        this.currentPage = response.page || 1;
        
        this.loading = false;
        console.log('Doctors loaded successfully:', this.doctors.length, 'doctors');
      },
      error: (err) => {
        console.error('Error loading doctors:', err);
        this.error = 'Error al cargar los médicos. Verifique la conexión con el servidor.';
        this.doctors = [];
        this.totalItems = 0;
        this.totalPages = 0;
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadDoctors();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.currentPage = 1;
    this.loadDoctors();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadDoctors();
    }
  }

  onStatusFilterChange(): void {
    this.currentPage = 1;
    this.loadDoctors();
  }

  viewDoctor(doctor: Doctor): void {
    this.selectedDoctor = doctor;
    this.isEditMode = false;
  }

  closeDoctorModal(): void {
    this.selectedDoctor = null;
    this.isEditMode = false;
  }

  openCreateModal(): void {
    this.formData = this.getEmptyFormData();
    this.isEditMode = false;
    this.showFormModal = true;
    this.formError = null;
  }

  openEditModal(doctor: Doctor): void {
    this.formData = {
      id: doctor.id,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      specialty: doctor.specialty,
      licenseNumber: doctor.licenseNumber,
      phone: doctor.phone,
      email: doctor.email,
      address: doctor.address,
      institution: doctor.institution,
      isStaff: doctor.isStaff,
      isActive: doctor.isActive,
      notes: doctor.notes || ''
    };
    this.isEditMode = true;
    this.showFormModal = true;
    this.formError = null;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.formData = this.getEmptyFormData();
    this.formError = null;
    this.saving = false;
  }

  saveDoctor(): void {
    this.saving = true;
    this.formError = null;

    const doctorData: CreateDoctorRequest | UpdateDoctorRequest = {
      firstName: this.formData.firstName,
      lastName: this.formData.lastName,
      specialty: this.formData.specialty,
      licenseNumber: this.formData.licenseNumber,
      phone: this.formData.phone,
      email: this.formData.email,
      address: this.formData.address,
      institution: this.formData.institution,
      isStaff: this.formData.isStaff,
      isActive: this.formData.isActive,
      notes: this.formData.notes || undefined
    };

    if (this.isEditMode && this.formData.id) {
      this.doctorService.updateDoctor(this.formData.id, doctorData).subscribe({
        next: (updatedDoctor) => {
          const index = this.doctors.findIndex(d => d.id === updatedDoctor.id);
          if (index !== -1) {
            this.doctors[index] = updatedDoctor;
          }
          this.closeFormModal();
          this.loadDoctors();
        },
        error: (err) => {
          this.formError = err.message;
          this.saving = false;
        }
      });
    } else {
      this.doctorService.createDoctor(doctorData as CreateDoctorRequest).subscribe({
        next: () => {
          this.closeFormModal();
          this.loadDoctors();
        },
        error: (err) => {
          this.formError = err.message;
          this.saving = false;
        }
      });
    }
  }

  toggleStatus(doctor: Doctor): void {
    const action = doctor.isActive ? 'desactivar' : 'activar';
    this.confirmAction = {
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Médico`,
      message: `¿Está seguro que desea ${action} al médico ${doctor.firstName} ${doctor.lastName}?`,
      action: () => this.executeToggleStatus(doctor)
    };
    this.showConfirmModal = true;
  }

  executeToggleStatus(doctor: Doctor): void {
    if (!doctor.id) return;

    this.doctorService.toggleDoctorStatus(doctor.id, !doctor.isActive).subscribe({
      next: (updatedDoctor) => {
        const index = this.doctors.findIndex(d => d.id === doctor.id);
        if (index !== -1) {
          this.doctors[index] = updatedDoctor;
        }
        this.closeModal();
      },
      error: (err) => {
        this.error = err.message;
        this.closeModal();
      }
    });
  }

  deleteDoctor(doctor: Doctor): void {
    this.confirmAction = {
      title: 'Eliminar Médico',
      message: `¿Está seguro que desea eliminar permanentemente al médico ${doctor.firstName} ${doctor.lastName}? Esta acción no se puede deshacer.`,
      action: () => this.executeDelete(doctor)
    };
    this.showConfirmModal = true;
  }

  executeDelete(doctor: Doctor): void {
    if (!doctor.id) return;

    this.doctorService.deleteDoctor(doctor.id).subscribe({
      next: () => {
        this.loadDoctors();
        this.closeModal();
      },
      error: (err) => {
        this.error = err.message;
        this.closeModal();
      }
    });
  }

  closeModal(): void {
    this.showConfirmModal = false;
    this.confirmAction = { title: '', message: '', action: () => {} };
  }

  getEmptyFormData(): CreateDoctorRequest & { id?: string } {
    return {
      firstName: '',
      lastName: '',
      specialty: '',
      licenseNumber: '',
      phone: '',
      email: '',
      address: '',
      institution: '',
      isStaff: false,
      isActive: true,
      notes: ''
    };
  }
}
