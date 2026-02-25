import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PatientHistoryService } from '../../../services/patient-history.service';
import { PatientService } from '../../../services/patient.service';
import { PatientHistoryResponse, PatientHistoryExam, PatientHistoryPatient } from '../../../models/patient-history.interface';
import { Patient } from '../../../models/patient.interface';

@Component({
  selector: 'app-patient-history',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="patient-history">
      <!-- Header -->
      <div class="history-header">
        <button class="btn-back" (click)="goBack()">
          <i class="fa fa-arrow-left"></i>
          <span>Volver</span>
        </button>
        <h1>Historial de Exámenes</h1>
      </div>

      <!-- Patient Selector Section -->
      <div class="patient-selector-section">
        <div class="selector-card">
          <h3 class="selector-title">Seleccionar Paciente</h3>
          <div class="selector-input-group">
            <select [(ngModel)]="selectedPatientId" 
                    (change)="onPatientSelected()"
                    class="patient-select"
                    [disabled]="patients.length === 0">
              <option value="">-- Selecciona un paciente --</option>
              <option *ngFor="let patient of patients" [value]="patient.id">
                {{ patient.name }} ({{ patient.id }})
              </option>
            </select>
            <button *ngIf="selectedPatientId && !isLoading" 
                    class="btn-search"
                    (click)="loadPatientHistory()">
              <i class="fa fa-search"></i>
              Buscar
            </button>
          </div>
          <p *ngIf="patients.length === 0" class="loading-patients">
            <i class="fa fa-spinner fa-spin"></i>
            Cargando lista de pacientes...
          </p>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Cargando historial del paciente...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="errorMessage" class="error-state">
        <i class="fa fa-exclamation-circle"></i>
        <p>{{ errorMessage }}</p>
        <button class="btn-retry" (click)="loadPatientHistory()">
          <i class="fa fa-refresh"></i>
          Reintentar
        </button>
      </div>

      <!-- Patient Information Section -->
      <div *ngIf="!isLoading && !errorMessage && patientData" class="patient-info-section">
        <div class="patient-info-card">
          <div class="patient-avatar">
            <i [class]="getSexIcon(patientData.sex)"></i>
          </div>
          <div class="patient-details">
            <h2 class="patient-name">{{ patientData.name }}</h2>
            <div class="patient-meta">
              <div class="meta-item">
                <span class="meta-label">Sexo:</span>
                <span class="meta-value">{{ getSexLabel(patientData.sex) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Fecha de Nacimiento:</span>
                <span class="meta-value">{{ formatDate(patientData.birthDate) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Teléfono:</span>
                <span class="meta-value">{{ patientData.phone }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Exams Table Section -->
      <div *ngIf="!isLoading && !errorMessage && patientData && examsData" class="exams-section">
        <div class="section-header">
          <h3>Exámenes Realizados</h3>
          <span class="exam-count">{{ examsData.length }} exámenes</span>
        </div>

        <!-- Desktop Table View -->
        <div class="table-container desktop">
          <table class="exams-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo de Examen</th>
                <th>Nombre del Examen</th>
                <th>Número de Muestra</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let exam of examsData" [attr.data-status]="exam.status">
                <td class="exam-date">{{ formatDateTime(exam.testDate) }}</td>
                <td class="exam-type">{{ exam.testType }}</td>
                <td class="exam-name">{{ exam.testName }}</td>
                <td class="exam-sample">{{ exam.sampleNumber }}</td>
                <td class="exam-status">
                  <span [ngClass]="'status-badge status-' + exam.status.toLowerCase()">
                    {{ formatStatus(exam.status) }}
                  </span>
                </td>
                <td class="exam-actions">
                  <button class="btn-view" (click)="viewExamDetail(exam)" 
                          title="Ver detalles del examen">
                    <i class="fa fa-eye"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Card View -->
        <div class="cards-container mobile">
          <div *ngFor="let exam of examsData" class="exam-card" [attr.data-status]="exam.status">
            <div class="card-header">
              <div class="card-title">{{ exam.testType }}</div>
              <span [ngClass]="'status-badge status-' + exam.status.toLowerCase()">
                {{ formatStatus(exam.status) }}
              </span>
            </div>
            <div class="card-content">
              <div class="card-row">
                <span class="card-label">Examen:</span>
                <span class="card-value">{{ exam.testName }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">Muestra:</span>
                <span class="card-value">{{ exam.sampleNumber }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">Fecha:</span>
                <span class="card-value">{{ formatDateTime(exam.testDate) }}</span>
              </div>
            </div>
            <div class="card-footer">
              <button class="btn-view" (click)="viewExamDetail(exam)">
                <i class="fa fa-eye"></i>
                Ver Detalles
              </button>
            </div>
          </div>
        </div>

        <!-- No Exams State -->
        <div *ngIf="examsData.length === 0" class="no-exams-state">
          <i class="fa fa-inbox"></i>
          <p>No hay exámenes registrados para este paciente</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .patient-history {
      padding: 30px;
      background-color: #f8fafc;
      min-height: calc(100vh - 70px);
    }

    /* Header */
    .history-header {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 30px;
    }

    .history-header h1 {
      font-size: 28px;
      color: #1f2937;
      margin: 0;
    }

    .btn-back {
      background: white;
      border: 1px solid #e5e7eb;
      padding: 10px 16px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #4b5563;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-back:hover {
      background: #f3f4f6;
      border-color: #d1d5db;
    }

    /* Patient Selector Section */
    .patient-selector-section {
      margin-bottom: 30px;
    }

    .selector-card {
      background: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .selector-title {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 16px 0;
    }

    .selector-input-group {
      display: flex;
      gap: 12px;
      align-items: flex-end;
    }

    .patient-select {
      flex: 1;
      padding: 12px 14px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 14px;
      color: #1f2937;
      background-color: white;
      cursor: pointer;
      transition: all 0.2s;
    }

    .patient-select:hover {
      border-color: #d1d5db;
    }

    .patient-select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .patient-select:disabled {
      background-color: #f3f4f6;
      cursor: not-allowed;
      opacity: 0.6;
    }

    .btn-search {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .btn-search:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .btn-search:active {
      transform: translateY(0);
    }

    .loading-patients {
      color: #6b7280;
      font-size: 14px;
      margin: 16px 0 0 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .loading-patients i {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Loading and Error States */
    .loading-state,
    .error-state,
    .no-exams-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e5e7eb;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 20px;
    }

    .loading-state p,
    .error-state p,
    .no-exams-state p {
      color: #6b7280;
      font-size: 16px;
      margin: 0;
    }

    .error-state {
      background: white;
      border: 1px solid #fee2e2;
      border-radius: 8px;
      color: #dc2626;
    }

    .error-state i {
      font-size: 32px;
      margin-bottom: 12px;
      color: #dc2626;
    }

    .btn-retry {
      margin-top: 16px;
      background: #dc2626;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }

    .btn-retry:hover {
      background: #b91c1c;
    }

    .no-exams-state {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      color: #6b7280;
    }

    .no-exams-state i {
      font-size: 48px;
      margin-bottom: 12px;
      color: #d1d5db;
    }

    /* Patient Info Section */
    .patient-info-section {
      margin-bottom: 30px;
    }

    .patient-info-card {
      background: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: flex-start;
      gap: 25px;
    }

    .patient-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 32px;
      flex-shrink: 0;
    }

    .patient-details {
      flex: 1;
    }

    .patient-name {
      font-size: 24px;
      font-weight: 600;
      color: #111827;
      margin: 0 0 16px 0;
    }

    .patient-meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
    }

    .meta-label {
      font-size: 12px;
      color: #6b7280;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .meta-value {
      font-size: 14px;
      color: #1f2937;
      font-weight: 500;
    }

    /* Exams Section */
    .exams-section {
      background: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 2px solid #f3f4f6;
    }

    .section-header h3 {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
    }

    .exam-count {
      background: #f3f4f6;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
    }

    /* Table Styles */
    .table-container {
      overflow-x: auto;
    }

    .exams-table {
      width: 100%;
      border-collapse: collapse;
    }

    .exams-table thead {
      background-color: #f9fafb;
    }

    .exams-table th {
      padding: 12px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: #4b5563;
      text-transform: uppercase;
      border-bottom: 2px solid #e5e7eb;
    }

    .exams-table tbody tr {
      border-bottom: 1px solid #e5e7eb;
      transition: background-color 0.2s;
    }

    .exams-table tbody tr:hover {
      background-color: #f9fafb;
    }

    .exams-table td {
      padding: 14px 12px;
      font-size: 14px;
      color: #374151;
    }

    .exam-date {
      font-weight: 500;
      color: #1f2937;
    }

    .exam-type {
      font-weight: 600;
      color: #667eea;
    }

    .exam-status {
      text-align: center;
    }

    .exam-actions {
      text-align: center;
    }

    /* Status Badge */
    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-completed {
      background-color: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }

    .status-pending {
      background-color: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }

    .status-failed {
      background-color: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    .status-processing {
      background-color: rgba(59, 130, 246, 0.1);
      color: #3b82f6;
    }

    /* View Button */
    .btn-view {
      background: white;
      border: 1px solid #e5e7eb;
      width: 36px;
      height: 36px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #4b5563;
      font-size: 14px;
      transition: all 0.2s;
    }

    .btn-view:hover {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }

    /* Mobile Card View */
    .cards-container {
      display: none;
      gap: 16px;
    }

    .exam-card {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      transition: all 0.2s;
    }

    .exam-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-color: #d1d5db;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid #f3f4f6;
    }

    .card-title {
      font-size: 14px;
      font-weight: 600;
      color: #1f2937;
    }

    .card-content {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 12px;
    }

    .card-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
    }

    .card-label {
      color: #6b7280;
      font-weight: 500;
    }

    .card-value {
      color: #1f2937;
      font-weight: 600;
    }

    .card-footer {
      padding-top: 12px;
      border-top: 1px solid #f3f4f6;
    }

    .card-footer .btn-view {
      width: 100%;
      height: auto;
      padding: 8px 12px;
      font-size: 13px;
      justify-content: center;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .patient-history {
        padding: 20px;
      }

      .history-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .history-header h1 {
        font-size: 22px;
      }

      .selector-input-group {
        flex-direction: column;
        align-items: stretch;
      }

      .btn-search {
        justify-content: center;
      }

      .patient-info-card {
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 20px;
      }

      .patient-meta {
        grid-template-columns: 1fr;
      }

      .table-container.desktop {
        display: none;
      }

      .cards-container.mobile {
        display: flex;
        flex-direction: column;
      }

      .exams-section {
        padding: 20px;
      }
    }

    @media (max-width: 480px) {
      .patient-history {
        padding: 15px;
      }

      .patient-avatar {
        width: 70px;
        height: 70px;
        font-size: 28px;
      }

      .patient-name {
        font-size: 20px;
      }

      .history-header h1 {
        font-size: 20px;
      }

      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      .exam-card {
        padding: 12px;
      }

      .card-row {
        font-size: 12px;
      }

      .status-badge {
        padding: 4px 10px;
        font-size: 11px;
      }

      .selector-card {
        padding: 20px;
      }
    }
  `]
})
export class PatientHistoryComponent implements OnInit, OnDestroy {
  patientData: PatientHistoryPatient | null = null;
  examsData: PatientHistoryExam[] = [];
  patients: Patient[] = [];
  selectedPatientId: string = '';
  isLoading = false;
  errorMessage = '';
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private patientHistoryService: PatientHistoryService,
    private patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.patientService.getPatients()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.patients = response.data || response || [];
        },
        error: (error: any) => {
          console.error('Error loading patients:', error);
        }
      });
  }

  onPatientSelected(): void {
    if (this.selectedPatientId) {
      this.loadPatientHistory();
    }
  }

  loadPatientHistory(): void {
    if (!this.selectedPatientId) {
      this.errorMessage = 'Por favor selecciona un paciente';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.patientHistoryService
      .getPatientExamsSummary(this.selectedPatientId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: PatientHistoryResponse) => {
          this.patientData = response.patient;
          this.examsData = response.exams || [];
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading patient history:', error);
          this.errorMessage = 'No se pudo cargar el historial del paciente. Intenta nuevamente.';
          this.isLoading = false;
        }
      });
  }

  formatDate(date: string): string {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDateTime(date: string): string {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      completed: 'Completado',
      pending: 'Pendiente',
      processing: 'Procesando',
      failed: 'Error'
    };
    return statusMap[status.toLowerCase()] || status;
  }

  getSexLabel(sex: string): string {
    const sexMap: { [key: string]: string } = {
      M: 'Masculino',
      F: 'Femenino',
      O: 'Otro'
    };
    return sexMap[sex] || sex;
  }

  getSexIcon(sex: string): string {
    switch (sex.toUpperCase()) {
      case 'M':
        return 'fa fa-male';
      case 'F':
        return 'fa fa-female';
      default:
        return 'fa fa-user';
    }
  }

  viewExamDetail(exam: PatientHistoryExam): void {
    console.log('View exam detail:', exam);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
