import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Patient } from '../../../models/patient.interface';
import { ConfirmAction } from '../../../models/common.interface';
import { PatientService } from '../../../services/patient.service';
import { GenresLabels } from '../../../enums/genres.enums';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
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
              [(ngModel)]="searchTerm"
              (input)="onSearch()"
              class="search-input">
            <button class="btn-secondary" (click)="clearSearch()">Limpiar</button>
            <select [(ngModel)]="statusFilter" (change)="onStatusFilterChange()" class="filter-select">
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
      <div *ngIf="loading" class="loading">
        Cargando pacientes...
      </div>

      <!-- Error -->
      <div *ngIf="error" class="error">
        Error: {{ error }}
      </div>

      <!-- Tabla de pacientes -->
      <div *ngIf="!loading && !error" class="table-container">
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
            <tr *ngFor="let patient of patients" [class.inactive]="!patient.isActive">
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
                <button 
                  class="action-btn delete-btn" 
                  (click)="deletePatient(patient)" 
                  *ngIf="!patient.isActive"
                  title="Eliminar paciente permanentemente">
                  🗑️ Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Controles de paginación -->
        <div class="pagination" *ngIf="!loading && !error && totalPages > 1">
          <button 
            class="btn" 
            (click)="goToPage(currentPage - 1)" 
            [disabled]="currentPage === 1">
            ← Anterior
          </button>
          
          <span class="page-info">
            Página {{ currentPage }} de {{ totalPages }} ({{ totalItems }} pacientes totales)
          </span>
          
          <button 
            class="btn" 
            (click)="goToPage(currentPage + 1)" 
            [disabled]="currentPage === totalPages">
            Siguiente →
          </button>
        </div>

        <!-- Mensaje cuando no hay datos -->
        <div *ngIf="!loading && totalItems === 0" class="no-data">
          <p *ngIf="searchTerm">No se encontraron pacientes que coincidan con "{{ searchTerm }}"</p>
          <p *ngIf="!searchTerm">No hay pacientes registrados.</p>
          <button class="btn-primary" [routerLink]="['/patients/new']">
            + Registrar Primer Paciente
          </button>
        </div>
      </div>

      <!-- Modal de confirmación -->
      <div class="modal" *ngIf="showConfirmModal" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h3>{{ confirmAction.title }}</h3>
          <p>{{ confirmAction.message }}</p>
          <div class="modal-actions">
            <button class="btn-secondary" (click)="closeModal()">Cancelar</button>
            <button class="btn-danger" (click)="confirmAction.action()">Confirmar</button>
          </div>
        </div>
      </div>

      <!-- Modal de detalles del paciente -->
      <div class="modal" *ngIf="selectedPatient" (click)="closePatientModal()">
        <div class="modal-content large" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Detalles del Paciente</h3>
            <button class="close-btn" (click)="closePatientModal()">×</button>
          </div>
          
          <div class="patient-details">
            <div class="detail-section">
              <h4>Información Personal</h4>
              <div class="detail-grid">
                <div><strong>Nombre:</strong> {{ selectedPatient.name }}</div>
                <div><strong>DNI:</strong> {{ selectedPatient.dni || 'No registrado' }}</div>
                <div><strong>Fecha de Nacimiento:</strong> {{ formatDate(selectedPatient.birthDate) }}</div>
                <div><strong>Edad:</strong> {{ selectedPatient.age }} años</div>
                <div><strong>Sexo:</strong> {{ getSexLabel(selectedPatient.sex) }}</div>
                <div><strong>Grupo de Referencia:</strong> {{ selectedPatient.referenceGroup || 'No asignado' }}</div>
                <div><strong>Tipo de Sangre:</strong> {{ selectedPatient.bloodType || 'No registrado' }}</div>
              </div>
            </div>

            <div class="detail-section">
              <h4>Contacto</h4>
              <div class="detail-grid">
                <div><strong>Teléfono:</strong> {{ selectedPatient.phone }}</div>
                <div><strong>Email:</strong> {{ selectedPatient.email || 'No registrado' }}</div>
                <div><strong>Dirección:</strong> {{ selectedPatient.address || 'No registrada' }}</div>
              </div>
            </div>

            <div class="detail-section">
              <h4>Información Médica</h4>
              <div class="detail-field">
                <strong>Alergias:</strong> 
                <p>{{ selectedPatient.allergies || 'No registra alergias' }}</p>
              </div>
              <div class="detail-field">
                <strong>Historia Médica:</strong>
                <p>{{ selectedPatient.medicalHistory || 'Sin historia médica registrada' }}</p>
              </div>
              <div class="detail-field">
                <strong>Medicamentos Actuales:</strong>
                <p>{{ selectedPatient.currentMedications || 'No toma medicamentos actualmente' }}</p>
              </div>
            </div>

            <div class="detail-section">
              <h4>Contacto de Emergencia</h4>
              <div class="detail-grid">
                <div><strong>Nombre:</strong> {{ selectedPatient.emergencyContactName || 'No registrado' }}</div>
                <div><strong>Relación:</strong> {{ selectedPatient.emergencyContactRelationship || 'No especificada' }}</div>
                <div><strong>Teléfono:</strong> {{ selectedPatient.emergencyContactPhone || 'No registrado' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      gap: 20px;
      flex-wrap: wrap;
    }

    .header-left {
      flex: 0 0 auto;
    }

    .header-center {
      flex: 1;
      display: flex;
      justify-content: center;
      min-width: 0;
    }

    .header-right {
      flex: 0 0 auto;
    }

    .header h1 {
      color: #2c3e50;
      margin: 0;
      font-size: 28px;
    }

    .search-controls {
      display: flex;
      gap: 10px;
      align-items: center;
      max-width: 600px;
      width: 100%;
    }

    .search-input {
      flex: 1;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      min-width: 250px;
    }

    .filter-select {
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background-color: white;
      font-size: 14px;
      min-width: 150px;
    }

    .loading, .error {
      text-align: center;
      padding: 40px;
      font-size: 16px;
    }

    .error {
      color: #e74c3c;
      background-color: #fadbd8;
      border-radius: 4px;
    }

    .table-container {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .patients-table {
      width: 100%;
      border-collapse: collapse;
    }

    .patients-table th {
      background-color: #34495e;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }

    .patients-table td {
      padding: 12px;
      border-bottom: 1px solid #ecf0f1;
    }

    .patients-table tr:hover {
      background-color: #f8f9fa;
    }

    .patients-table tr.inactive {
      opacity: 0.6;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .status-badge.active {
      background-color: #d4edda;
      color: #155724;
    }

    .status-badge.inactive {
      background-color: #f8d7da;
      color: #721c24;
    }

    .actions {
      display: flex;
      gap: 5px;
      flex-wrap: wrap;
    }

    .btn-primary {
      background-color: #3498db;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
      font-size: 14px;
    }

    .btn-secondary {
      background-color: #95a5a6;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    }

    .action-btn {
      padding: 6px 12px;
      margin: 0 2px;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
      font-weight: 500;
    }

    .view-btn {
      background-color: #27ae60;
      color: white;
    }

    .view-btn:hover {
      background-color: #229954;
      transform: translateY(-1px);
    }

    .edit-btn {
      background-color: #f39c12;
      color: white;
    }

    .edit-btn:hover {
      background-color: #d68910;
      transform: translateY(-1px);
    }

    .status-active-btn {
      background-color: #e74c3c;
      color: white;
    }

    .status-active-btn:hover {
      background-color: #c0392b;
      transform: translateY(-1px);
    }

    .status-inactive-btn {
      background-color: #27ae60;
      color: white;
    }

    .status-inactive-btn:hover {
      background-color: #229954;
      transform: translateY(-1px);
    }

    .delete-btn {
      background-color: #e74c3c;
      color: white;
    }

    .delete-btn:hover {
      background-color: #c0392b;
      transform: translateY(-1px);
    }

    .action-btn:active {
      transform: translateY(0);
    }

    .btn-danger {
      background-color: #dc3545;
    }

    .pagination-info {
      padding: 15px 20px;
      background-color: #f8f9fa;
      border-top: 1px solid #dee2e6;
      text-align: center;
    }

    .results-info {
      color: #6c757d;
      font-size: 14px;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 15px;
      margin-top: 25px;
    }

    .no-data {
      padding: 40px;
      text-align: center;
      background-color: #f8f9fa;
      border-top: 1px solid #dee2e6;
    }

    .no-data p {
      color: #6c757d;
      margin-bottom: 20px;
      font-size: 16px;
    }

   /* Buttons */
    .btn {
      background: #007bff;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }

    .btn:hover:not(:disabled) {
      background: #0056b3;
      transform: translateY(-1px);
    }

    .btn:disabled {
      background: #6c757d;
      cursor: not-allowed;
      transform: none;
    }

    .page-info {
      color: #6c757d;
      font-size: 14px;
    }

    /* Modal styles */
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      padding: 30px;
      border-radius: 8px;
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-content.large {
      max-width: 800px;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #999;
    }

    .modal-actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 20px;
    }

    .patient-details {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .detail-section h4 {
      color: #2c3e50;
      margin-bottom: 10px;
      border-bottom: 2px solid #3498db;
      padding-bottom: 5px;
    }

    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .detail-field {
      margin-bottom: 15px;
    }

    .detail-field p {
      margin: 5px 0 0 0;
      color: #666;
    }

    @media (max-width: 1024px) {
      .header {
        flex-direction: column;
        align-items: stretch;
        gap: 15px;
      }
      
      .header-left,
      .header-center,
      .header-right {
        flex: none;
        width: 100%;
      }
      
      .header-center {
        order: 2;
      }
      
      .header-right {
        order: 3;
        display: flex;
        justify-content: center;
      }
      
      .search-controls {
        flex-direction: column;
        max-width: none;
      }
      
      .search-input {
        min-width: auto;
      }
      
      .filter-select {
        min-width: auto;
      }
    }

    @media (max-width: 768px) {
      .actions {
        flex-direction: column;
      }
      
      .detail-grid {
        grid-template-columns: 1fr;
      }
      
      .patients-table {
        font-size: 12px;
      }
      
      .header h1 {
        font-size: 24px;
        text-align: center;
      }
      
      .container {
        padding: 15px;
      }
    }

    @media (max-width: 480px) {
      .search-controls {
        gap: 8px;
      }
      
      .search-input,
      .filter-select,
      .btn-secondary {
        padding: 8px;
        font-size: 13px;
      }
      
      .header h1 {
        font-size: 20px;
      }
    }
  `]
})
export class PatientListComponent implements OnInit {
  patients: Patient[] = [];
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
  selectedPatient: Patient | null = null;

  constructor(private patientService: PatientService) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.loading = true;
    this.error = null;

    this.patientService.getPatients(this.currentPage, this.itemsPerPage, this.searchTerm).subscribe({
      next: (response) => {
        console.log('Response from backend:', response);
        
        // Actualizar datos de la respuesta paginada
        this.patients = Array.isArray(response.data) ? response.data : [];
        this.totalItems = response.total || 0;
        this.totalPages = response.totalPages || 0;
        this.currentPage = response.page || 1;
        
        this.loading = false;
        console.log('Patients loaded successfully:', this.patients.length, 'patients');
      },
      error: (err) => {
        console.error('Error loading patients:', err);
        this.error = 'Error al cargar los pacientes. Verifique la conexión con el servidor.';
        this.patients = [];
        this.totalItems = 0;
        this.totalPages = 0;
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadPatients();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.statusFilter = '';
    this.currentPage = 1;
    this.loadPatients();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadPatients();
    }
  }

  onStatusFilterChange(): void {
    this.currentPage = 1;
    this.loadPatients();
  }

  viewPatient(id: string): void {
    const patient = this.patients.find(p => p.id === id);
    if (patient) {
      this.selectedPatient = patient;
    }
  }

  closePatientModal(): void {
    this.selectedPatient = null;
  }

  toggleStatus(patient: Patient): void {
    const action = patient.isActive ? 'desactivar' : 'activar';
    this.confirmAction = {
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Paciente`,
      message: `¿Está seguro que desea ${action} al paciente ${patient.name}?`,
      action: () => this.executeToggleStatus(patient)
    };
    this.showConfirmModal = true;
  }

  executeToggleStatus(patient: Patient): void {
    if (!patient.id) return;

    this.patientService.togglePatientStatus(patient.id, !patient.isActive).subscribe({
      next: (updatedPatient) => {
        const index = this.patients.findIndex(p => p.id === patient.id);
        if (index !== -1) {
          this.patients[index] = updatedPatient;
        }
        this.closeModal();
      },
      error: (err) => {
        this.error = err.message;
        this.closeModal();
      }
    });
  }

  deletePatient(patient: Patient): void {
    this.confirmAction = {
      title: 'Eliminar Paciente',
      message: `¿Está seguro que desea eliminar permanentemente al paciente ${patient.name}? Esta acción no se puede deshacer.`,
      action: () => this.executeDelete(patient)
    };
    this.showConfirmModal = true;
  }

  executeDelete(patient: Patient): void {
    if (!patient.id) return;

    this.patientService.deletePatient(patient.id).subscribe({
      next: () => {
        // Recargar la lista después de eliminar
        this.loadPatients();
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

  getSexLabel(sex: string): string {
    return GenresLabels[sex as keyof typeof GenresLabels] || sex;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-ES');
    } catch {
      return 'Fecha inválida';
    }
  }
}