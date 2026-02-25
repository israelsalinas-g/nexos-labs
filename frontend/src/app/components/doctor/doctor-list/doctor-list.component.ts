import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
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
  styleUrls: ['./doctor-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DoctorListComponent implements OnInit {
  private doctorService = inject(DoctorService);

  doctors = signal<Doctor[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  saving = signal<boolean>(false);
  formError = signal<string | null>(null);

  // Búsqueda y filtros
  searchTerm = signal<string>('');
  statusFilter = signal<string>('');

  // Paginación
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(4);
  totalItems = signal<number>(0);
  totalPages = signal<number>(0);

  // Modal state
  showConfirmModal = signal<boolean>(false);
  confirmAction = signal<ConfirmAction>({ title: '', message: '', action: () => { } });
  selectedDoctor = signal<Doctor | null>(null);

  // Form modal
  showFormModal = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  formData = signal<CreateDoctorRequest & { id?: string }>(this.getEmptyFormData());

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.loading.set(true);
    this.error.set(null);

    this.doctorService.getDoctors(this.currentPage(), this.itemsPerPage(), this.searchTerm()).subscribe({
      next: (response) => {
        this.doctors.set(Array.isArray(response.data) ? response.data : []);
        this.totalItems.set(response.total || 0);
        this.totalPages.set(response.totalPages || 0);
        this.currentPage.set(response.page || 1);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar los médicos. Verifique la conexión con el servidor.');
        this.doctors.set([]);
        this.totalItems.set(0);
        this.totalPages.set(0);
        this.loading.set(false);
      }
    });
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadDoctors();
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.statusFilter.set('');
    this.currentPage.set(1);
    this.loadDoctors();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadDoctors();
    }
  }

  onStatusFilterChange(): void {
    this.currentPage.set(1);
    this.loadDoctors();
  }

  viewDoctor(doctor: Doctor): void {
    this.selectedDoctor.set(doctor);
    this.isEditMode.set(false);
  }

  closeDoctorModal(): void {
    this.selectedDoctor.set(null);
    this.isEditMode.set(false);
  }

  openCreateModal(): void {
    this.formData.set(this.getEmptyFormData());
    this.isEditMode.set(false);
    this.showFormModal.set(true);
    this.formError.set(null);
  }

  openEditModal(doctor: Doctor): void {
    this.formData.set({
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
    });
    this.isEditMode.set(true);
    this.showFormModal.set(true);
    this.formError.set(null);
  }

  closeFormModal(): void {
    this.showFormModal.set(false);
    this.formData.set(this.getEmptyFormData());
    this.formError.set(null);
    this.saving.set(false);
  }

  saveDoctor(): void {
    this.saving.set(true);
    this.formError.set(null);
    const data = this.formData();

    const doctorData: CreateDoctorRequest | UpdateDoctorRequest = {
      firstName: data.firstName,
      lastName: data.lastName,
      specialty: data.specialty,
      licenseNumber: data.licenseNumber,
      phone: data.phone,
      email: data.email,
      address: data.address,
      institution: data.institution,
      isStaff: data.isStaff,
      isActive: data.isActive,
      notes: data.notes || undefined
    };

    if (this.isEditMode() && data.id) {
      this.doctorService.updateDoctor(data.id, doctorData).subscribe({
        next: () => { this.closeFormModal(); this.loadDoctors(); },
        error: (err) => { this.formError.set(err.message); this.saving.set(false); }
      });
    } else {
      this.doctorService.createDoctor(doctorData as CreateDoctorRequest).subscribe({
        next: () => { this.closeFormModal(); this.loadDoctors(); },
        error: (err) => { this.formError.set(err.message); this.saving.set(false); }
      });
    }
  }

  toggleStatus(doctor: Doctor): void {
    const action = doctor.isActive ? 'desactivar' : 'activar';
    this.confirmAction.set({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Médico`,
      message: `¿Está seguro que desea ${action} al médico ${doctor.firstName} ${doctor.lastName}?`,
      action: () => this.executeToggleStatus(doctor)
    });
    this.showConfirmModal.set(true);
  }

  executeToggleStatus(doctor: Doctor): void {
    if (!doctor.id) return;
    this.doctorService.toggleDoctorStatus(doctor.id, !doctor.isActive).subscribe({
      next: (updatedDoctor) => {
        const updated = this.doctors().map(d => d.id === doctor.id ? updatedDoctor : d);
        this.doctors.set(updated);
        this.closeModal();
      },
      error: (err) => { this.error.set(err.message); this.closeModal(); }
    });
  }

  deleteDoctor(doctor: Doctor): void {
    this.confirmAction.set({
      title: 'Eliminar Médico',
      message: `¿Está seguro que desea eliminar permanentemente al médico ${doctor.firstName} ${doctor.lastName}? Esta acción no se puede deshacer.`,
      action: () => this.executeDelete(doctor)
    });
    this.showConfirmModal.set(true);
  }

  executeDelete(doctor: Doctor): void {
    if (!doctor.id) return;
    this.doctorService.deleteDoctor(doctor.id).subscribe({
      next: () => { this.loadDoctors(); this.closeModal(); },
      error: (err) => { this.error.set(err.message); this.closeModal(); }
    });
  }

  closeModal(): void {
    this.showConfirmModal.set(false);
    this.confirmAction.set({ title: '', message: '', action: () => { } });
  }

  getEmptyFormData(): CreateDoctorRequest & { id?: string } {
    return {
      firstName: '', lastName: '', specialty: '', licenseNumber: '',
      phone: '', email: '', address: '', institution: '',
      isStaff: false, isActive: true, notes: ''
    };
  }
}
