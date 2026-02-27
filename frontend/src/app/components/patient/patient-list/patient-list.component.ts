import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Patient } from '../../../models/patient.interface';
import { ConfirmAction } from '../../../models/common.interface';
import { PatientService } from '../../../services/patient.service';
import { GenresLabels } from '../../../enums/genres.enums';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, DecimalPipe],
  template: `
    <div class="container">
      <div class="header">
        <div class="header-left">
          <h1>Gestión de Pacientes</h1>
        </div>
        
        <div class="header-center">
          <div class="search-controls">
            <input 
              type="text" 
              placeholder="Buscar por nombre, DNI o email..." 
              [ngModel]="searchTerm()"
              (ngModelChange)="searchTerm.set($event)"
              (input)="onSearch()"
              class="search-input">
            <button class="btn-secondary" (click)="clearSearch()">Limpiar</button>
            <select [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event); onStatusFilterChange()" class="filter-select">
              <option value="">Todos los estados</option>
              <option value="active">Solo activos</option>
              <option value="inactive">Solo inactivos</option>
            </select>
          </div>
        </div>
        
        <div class="header-right">
          <button class="btn-primary" [routerLink]="['/patients/new']">
            + Nuevo Paciente
          </button>
        </div>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="loading">
          Cargando pacientes...
        </div>
      }

      <!-- Error -->
      @if (error()) {
        <div class="error">
          Error: {{ error() }}
        </div>
      }

      <!-- Tabla de pacientes -->
      @if (!loading() && !error()) {
        <div class="table-container">
          <table class="patients-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>DNI</th>
                <th>Edad</th>
                <th>Sexo</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (patient of patients(); track patient.id) {
                <tr [class.inactive]="!patient.isActive">
                  <td>{{ patient.name }}</td>
                  <td>{{ patient.dni || 'N/A' }}</td>
                  <td>{{ patient.age }}</td>
                  <td>{{ getSexLabel(patient.sex) }}</td>
                  <td>{{ patient.phone }}</td>
                  <td>
                    <span class="status-badge" [class]="patient.isActive ? 'active' : 'inactive'">
                      {{ patient.isActive ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="actions">
                    <button class="action-btn view-btn" (click)="viewPatient(patient.id!)" title="Ver detalles">👁️ Ver</button>
                    <button class="action-btn edit-btn" [routerLink]="['/patients/edit', patient.id]" title="Editar paciente">✏️ Editar</button>
                    <button 
                      class="action-btn" 
                      [class.status-active-btn]="patient.isActive"
                      [class.status-inactive-btn]="!patient.isActive"
                      (click)="toggleStatus(patient)"
                      [title]="patient.isActive ? 'Desactivar paciente' : 'Activar paciente'">
                      {{ patient.isActive ? '🔴 Desactivar' : '🟢 Activar' }}
                    </button>
                    @if (!patient.isActive) {
                      <button 
                        class="action-btn delete-btn" 
                        (click)="deletePatient(patient)" 
                        title="Eliminar paciente permanentemente">
                        🗑️ Eliminar
                      </button>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="no-data-td">No se encontraron pacientes.</td>
                </tr>
              }
            </tbody>
          </table>

          <!-- Controles de paginación -->
          @if (totalPages() > 1) {
            <div class="pagination">
              <button 
                class="btn" 
                (click)="goToPage(currentPage() - 1)" 
                [disabled]="currentPage() === 1">
                ← Anterior
              </button>
              
              <span class="page-info">
                Página {{ currentPage() }} de {{ totalPages() }} ({{ totalItems() }} pacientes totales)
              </span>
              
              <button 
                class="btn" 
                (click)="goToPage(currentPage() + 1)" 
                [disabled]="currentPage() === totalPages()">
                Siguiente →
              </button>
            </div>
          }

          <!-- Mensaje cuando no hay datos -->
          @if (totalItems() === 0) {
            <div class="no-data">
              <p>@if (searchTerm()) { No se encontraron pacientes que coincidan con "{{ searchTerm() }}" } @else { No hay pacientes registrados. }</p>
              <button class="btn-primary" [routerLink]="['/patients/new']">
                + Registrar Primer Paciente
              </button>
            </div>
          }
        </div>
      }

      <!-- Modal de confirmación -->
      @if (showConfirmModal()) {
        <div class="modal" (click)="closeModal()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <h3>{{ confirmAction().title }}</h3>
            <p>{{ confirmAction().message }}</p>
            <div class="modal-actions">
              <button class="btn-secondary" (click)="closeModal()">Cancelar</button>
              <button class="btn-danger" (click)="confirmAction().action()">Confirmar</button>
            </div>
          </div>
        </div>
      }

      <!-- Modal de detalles del paciente -->
      @if (selectedPatient()) {
        <div class="modal" (click)="closePatientModal()">
          <div class="modal-content large" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Detalles del Paciente</h3>
              <button class="close-btn" (click)="closePatientModal()">×</button>
            </div>
            
            <div class="patient-details">
              <div class="detail-section">
                <h4>Información Personal</h4>
                <div class="detail-grid">
                  <div><strong>Nombre:</strong> {{ selectedPatient()?.name }}</div>
                  <div><strong>DNI:</strong> {{ selectedPatient()?.dni || 'No registrado' }}</div>
                  <div><strong>Fecha de Nacimiento:</strong> {{ formatDate(selectedPatient()?.birthDate!) }}</div>
                  <div><strong>Edad:</strong> {{ selectedPatient()?.age }} años</div>
                  <div><strong>Sexo:</strong> {{ getSexLabel(selectedPatient()?.sex!) }}</div>
                  <div><strong>Grupo de Referencia:</strong> {{ selectedPatient()?.referenceGroup || 'No asignado' }}</div>
                  <div><strong>Tipo de Sangre:</strong> {{ selectedPatient()?.bloodType || 'No registrado' }}</div>
                </div>
              </div>

              <div class="detail-section">
                <h4>Contacto</h4>
                <div class="detail-grid">
                  <div><strong>Teléfono:</strong> {{ selectedPatient()?.phone }}</div>
                  <div><strong>Email:</strong> {{ selectedPatient()?.email || 'No registrado' }}</div>
                  <div><strong>Dirección:</strong> {{ selectedPatient()?.address || 'No registrada' }}</div>
                </div>
              </div>

              <div class="detail-section">
                <h4>Información Médica</h4>
                <div class="detail-field">
                  <strong>Alergias:</strong> 
                  <p>{{ selectedPatient()?.allergies || 'No registra alergias' }}</p>
                </div>
                <div class="detail-field">
                  <strong>Historia Médica:</strong>
                  <p>{{ selectedPatient()?.medicalHistory || 'Sin historia médica registrada' }}</p>
                </div>
                <div class="detail-field">
                  <strong>Medicamentos Actuales:</strong>
                  <p>{{ selectedPatient()?.currentMedications || 'No toma medicamentos actualmente' }}</p>
                </div>
              </div>

              <div class="detail-section">
                <h4>Contacto de Emergencia</h4>
                <div class="detail-grid">
                  <div><strong>Nombre:</strong> {{ selectedPatient()?.emergencyContactName || 'No registrado' }}</div>
                  <div><strong>Relación:</strong> {{ selectedPatient()?.emergencyContactRelationship || 'No especificada' }}</div>
                  <div><strong>Teléfono:</strong> {{ selectedPatient()?.emergencyContactPhone || 'No registrado' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; gap: 20px; flex-wrap: wrap; }
    .header h1 { color: var(--color-text); margin: 0; font-size: 28px; }
    .search-controls { display: flex; gap: 10px; align-items: center; max-width: 600px; width: 100%; }
    .search-input { flex: 1; padding: 10px; border: 1px solid var(--color-border); border-radius: 4px; font-size: 14px; min-width: 250px; background: var(--color-surface); color: var(--color-text); }
    .search-input::placeholder { color: var(--color-text-muted); }
    .filter-select { padding: 10px; border: 1px solid var(--color-border); border-radius: 4px; background-color: var(--color-surface); color: var(--color-text); font-size: 14px; min-width: 150px; }
    .loading, .error { text-align: center; padding: 40px; font-size: 16px; }
    .error { color: var(--color-error-text); background-color: var(--color-error-bg); border: 1px solid var(--color-error-border); border-radius: 4px; }
    .table-container { background: var(--color-surface); border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px var(--color-shadow); border: 1px solid var(--color-border); }
    .patients-table { width: 100%; border-collapse: collapse; }
    .patients-table th { background-color: var(--color-surface-alt); color: var(--color-text); padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid var(--color-border); }
    .patients-table td { padding: 12px; border-bottom: 1px solid var(--color-border); color: var(--color-text); }
    .patients-table tr:hover { background-color: var(--color-surface-alt); }
    .patients-table tr.inactive { opacity: 0.6; }
    .status-badge { padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .status-badge.active { background-color: rgba(34, 197, 94, 0.12); color: var(--color-success); }
    .status-badge.inactive { background-color: rgba(239, 68, 68, 0.12); color: var(--color-danger); }
    .actions { display: flex; gap: 5px; flex-wrap: wrap; }
    .btn-primary { background-color: var(--color-primary); color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; text-decoration: none; font-size: 14px; }
    .btn-secondary { background-color: var(--color-surface-alt); color: var(--color-text); border: 1px solid var(--color-border); padding: 8px 16px; border-radius: 4px; cursor: pointer; }
    .action-btn { padding: 6px 12px; border: none; border-radius: 4px; font-size: 12px; cursor: pointer; transition: all 0.2s; font-weight: 500; color: white; }
    .view-btn { background-color: var(--color-success); }
    .edit-btn { background-color: var(--color-warning); }
    .status-active-btn { background-color: var(--color-danger); }
    .status-inactive-btn { background-color: var(--color-success); }
    .delete-btn { background-color: var(--color-danger); }
    .action-btn:hover { opacity: 0.85; transform: translateY(-1px); }
    .pagination { display: flex; justify-content: center; align-items: center; gap: 15px; margin: 25px 0; }
    .page-info { color: var(--color-text-muted); font-size: 14px; }
    .no-data { padding: 40px; text-align: center; color: var(--color-text-muted); }
    .no-data-td { text-align: center; padding: 20px; color: var(--color-text-muted); }
    .btn { background: var(--color-primary); color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 14px; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
    .modal-content { background: var(--color-surface); border: 1px solid var(--color-border); padding: 30px; border-radius: 8px; max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto; box-shadow: 0 4px 16px var(--color-shadow); }
    .modal-content.large { max-width: 800px; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: var(--color-text-muted); }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
    .btn-danger { background-color: var(--color-danger); color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
    .patient-details { display: flex; flex-direction: column; gap: 20px; }
    .detail-section h4 { color: var(--color-text); margin-bottom: 10px; border-bottom: 2px solid var(--color-primary); padding-bottom: 5px; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .detail-field { margin-bottom: 15px; }
    .detail-field p { margin: 5px 0 0 0; color: var(--color-text-muted); }
    @media (max-width: 1024px) { .header { flex-direction: column; align-items: stretch; } }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PatientListComponent implements OnInit {
  private patientService = inject(PatientService);

  patients = signal<Patient[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  // Búsqueda y filtros
  searchTerm = signal<string>('');
  statusFilter = signal<string>('');

  // Paginación
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(7);
  totalItems = signal<number>(0);
  totalPages = signal<number>(0);

  // Modal
  showConfirmModal = signal<boolean>(false);
  confirmAction = signal<ConfirmAction>({ title: '', message: '', action: () => { } });
  selectedPatient = signal<Patient | null>(null);

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.loading.set(true);
    this.error.set(null);

    this.patientService.getPatients(this.currentPage(), this.itemsPerPage(), this.searchTerm().trim()).subscribe({
      next: (response) => {
        this.patients.set(Array.isArray(response.data) ? response.data : []);
        this.totalItems.set(response.total || 0);
        this.totalPages.set(response.totalPages || 0);
        this.currentPage.set(response.page || 1);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading patients:', err);
        this.error.set(err.message || 'Error al cargar los pacientes.');
        this.patients.set([]);
        this.loading.set(false);
      }
    });
  }

  onSearch(): void {
    this.currentPage.set(1);
    this.loadPatients();
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.statusFilter.set('');
    this.currentPage.set(1);
    this.loadPatients();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadPatients();
    }
  }

  onStatusFilterChange(): void {
    this.currentPage.set(1);
    this.loadPatients();
  }

  viewPatient(id: string): void {
    const patient = this.patients().find(p => p.id === id);
    if (patient) {
      this.selectedPatient.set(patient);
    }
  }

  closePatientModal(): void {
    this.selectedPatient.set(null);
  }

  toggleStatus(patient: Patient): void {
    const action = patient.isActive ? 'desactivar' : 'activar';
    this.confirmAction.set({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Paciente`,
      message: `¿Está seguro que desea ${action} al paciente ${patient.name}?`,
      action: () => this.executeToggleStatus(patient)
    });
    this.showConfirmModal.set(true);
  }

  executeToggleStatus(patient: Patient): void {
    if (!patient.id) return;

    this.patientService.togglePatientStatus(patient.id, !patient.isActive).subscribe({
      next: (updatedPatient) => {
        const currentPatients = this.patients();
        const index = currentPatients.findIndex(p => p.id === patient.id);
        if (index !== -1) {
          const updated = [...currentPatients];
          updated[index] = updatedPatient;
          this.patients.set(updated);
        }
        this.closeModal();
      },
      error: (err) => {
        this.error.set(err.message);
        this.closeModal();
      }
    });
  }

  deletePatient(patient: Patient): void {
    this.confirmAction.set({
      title: 'Eliminar Paciente',
      message: `¿Está seguro que desea eliminar permanentemente al paciente ${patient.name}? Esta acción no se puede deshacer.`,
      action: () => this.executeDelete(patient)
    });
    this.showConfirmModal.set(true);
  }

  executeDelete(patient: Patient): void {
    if (!patient.id) return;

    this.patientService.deletePatient(patient.id).subscribe({
      next: () => {
        this.loadPatients();
        this.closeModal();
      },
      error: (err) => {
        this.error.set(err.message);
        this.closeModal();
      }
    });
  }

  closeModal(): void {
    this.showConfirmModal.set(false);
    this.confirmAction.set({ title: '', message: '', action: () => { } });
  }

  getSexLabel(sex: string): string {
    return GenresLabels[sex as keyof typeof GenresLabels] || sex;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  }
}