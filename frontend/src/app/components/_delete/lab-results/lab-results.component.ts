import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LabResult } from '../../../models/lab-result.interface';
import { LabResultService } from '../../../services/lab-result.service';
import { PdfDymindDh36Service, PdfIchromaService, PdfUrineTestService, PdfStoolTestService } from '../../../services/pdf';

@Component({
  selector: 'app-lab-results',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="header">
        <div class="header-left">
          <h1>Hemogramas (Dymind DH36)</h1>
        </div>
      </div>

      <div *ngIf="loading" class="loading">
        🔄 Conectando con el servidor en http://localhost:3000/dymind-dh36...
      </div>
      
      <div *ngIf="error" class="error">
        ❌ Error al cargar los resultados: {{ error }}
        <br><small>Verifica que el backend esté ejecutándose en http://localhost:3000</small>
      </div>

      <div *ngIf="successMessage" class="success">
        ✅ {{ successMessage }}
      </div>

      <div *ngIf="!loading && !error && labResults.length === 0" class="no-data">
        📋 No se encontraron resultados de laboratorio.
        <br><small>Verifica que haya datos en la base de datos del backend.</small>
      </div>
      
      <div *ngIf="!loading && !error && labResults.length > 0" class="table-container">
        <!-- Results Table -->
        <div class="table-wrapper">
          <table class="results-table">
            <thead>
              <tr>
                <th>Muestra</th>
                <th>Nombre</th>
                <th>Fecha Análisis</th>
                <th>Estado</th>
                <th>Paciente</th>
                <th>Modo Análisis</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let result of paginatedResults; let i = index" 
                  class="result-row">
                <td class="sample-id" (click)="navigateToDetail(result.sampleNumber)">{{ result.sampleNumber }}</td>
                <td class="patient-name" (click)="navigateToDetail(result.sampleNumber)">{{ getPatientName(result) }}</td>
                <td class="analysis-date" (click)="navigateToDetail(result.sampleNumber)">{{ formatDate(result.testDate) }}</td>
                <td class="status" (click)="navigateToDetail(result.sampleNumber)">
                  <span [class]="getStatusClass(result)">
                    {{ getStatusText(result) }}
                  </span>
                </td>
                <td class="patient-info" (click)="navigateToDetail(result.sampleNumber)">
                  <div class="patient-details">
                    <span class="patient-id">ID: {{ result.patientId }}</span>
                    <span class="patient-age" *ngIf="result.patientAge">
                      Edad: {{ result.patientAge }} años
                    </span>
                  </div>
                </td>
                <td class="sample-type" (click)="navigateToDetail(result.sampleNumber)">{{ result.analysisMode }}</td>
                <td class="actions">
                  <button 
                    class="action-btn view-btn" 
                    (click)="navigateToDetail(result.sampleNumber)"
                    title="Ver detalle">
                    👁️ Ver
                  </button>
                  <button 
                    class="action-btn edit-btn" 
                    (click)="editLabResult(result, $event)"
                    title="Editar resultado">
                    ✏️ Editar
                  </button>
                  <button 
                    class="action-btn delete-btn" 
                    (click)="deleteLabResult(result.id)"
                    title="Eliminar resultado">
                    🗑️ Eliminar
                  </button>
                  <button 
                    class="action-btn pdf-btn" 
                    (click)="generatePdf(result.sampleNumber, $event)"
                    title="Descargar PDF">
                    �️ PDF
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination" *ngIf="totalPages > 1">
          <button 
            class="pagination-btn" 
            [disabled]="currentPage === 1" 
            (click)="goToPage(currentPage - 1)">
            ⬅ Anterior
          </button>
          
          <div class="page-numbers">
            <button 
              *ngFor="let page of getPageNumbers()" 
              class="page-btn" 
              [class.active]="page === currentPage"
              (click)="goToPage(page)">
              {{ page }}
            </button>
          </div>
          
          <button 
            class="pagination-btn" 
            [disabled]="currentPage === totalPages" 
            (click)="goToPage(currentPage + 1)">
            Siguiente ➡
          </button>
        </div>

        <!-- Results Summary -->
        <div class="results-summary">
          <span>Mostrando {{ getPaginationStart() }} - {{ getPaginationEnd() }} de {{ labResults.length }} resultados</span>
        </div>
      </div>

      <!-- Modal de Edición -->
      <div class="modal-overlay" *ngIf="showEditModal" (click)="closeEditModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Editar Resultado de Laboratorio</h3>
            <button class="close-btn" (click)="closeEditModal()">×</button>
          </div>
          
          <div class="modal-body" *ngIf="editingResult">
            <div class="result-info">
              <h4>Información General</h4>
              <div class="info-grid">
                <div class="info-item">
                  <label>Número de Muestra:</label>
                  <span>{{ editingResult.sampleNumber }}</span>
                </div>
                <div class="info-item">
                  <label>Paciente:</label>
                  <input 
                    type="text" 
                    [(ngModel)]="editingResult.patientName" 
                    class="form-control"
                    placeholder="Nombre del paciente">
                </div>
                <div class="info-item">
                  <label>ID Paciente:</label>
                  <input 
                    type="text" 
                    [(ngModel)]="editingResult.patientId" 
                    class="form-control"
                    placeholder="ID del paciente">
                </div>
                <div class="info-item">
                  <label>Edad:</label>
                  <input 
                    type="number" 
                    [(ngModel)]="editingResult.patientAge" 
                    class="form-control"
                    placeholder="Edad del paciente">
                </div>
                <div class="info-item">
                  <label>Sexo:</label>
                  <select [(ngModel)]="editingResult.patientSex" class="form-control">
                    <option value="">Seleccionar...</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="O">Otro</option>
                  </select>
                </div>
                <div class="info-item">
                  <label>Grupo de Referencia:</label>
                  <input 
                    type="text" 
                    [(ngModel)]="editingResult.referenceGroup" 
                    class="form-control"
                    placeholder="Grupo de referencia">
                </div>
              </div>
            </div>

            <div class="parameters-section">
              <h4>Parámetros del Análisis</h4>
              <div class="parameters-table">
                <table>
                  <thead>
                    <tr>
                      <th>Parámetro</th>
                      <th>Resultado <span class="editable-indicator">✏️</span></th>
                      <th>Unidad <span class="readonly-indicator">🔒</span></th>
                      <th>Estado <span class="readonly-indicator">🔒</span></th>
                      <th>Rango de Referencia <span class="readonly-indicator">🔒</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let param of editingResult.parameters; let i = index">
                      <td>{{ param.name }}</td>
                      <td>
                        <input 
                          type="text" 
                          [(ngModel)]="param.result" 
                          class="form-control small"
                          placeholder="Resultado">
                      </td>
                      <td class="readonly-field">{{ param.unit || 'N/A' }}</td>
                      <td class="readonly-field">
                        <span class="status-badge" [class]="getParameterStatusClass(param.status)">
                          {{ getParameterStatusText(param.status) }}
                        </span>
                      </td>
                      <td class="readonly-field">{{ param.referenceRange || 'N/A' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="btn-debug" (click)="debugData()" type="button">
              🔍 Ver Datos
            </button>
            <button class="btn-secondary" (click)="closeEditModal()">Cancelar</button>
            <button class="btn-primary" (click)="saveLabResult()" [disabled]="saving">
              {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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

     .header h1 {
      color: #2c3e50;
      margin: 0;
      font-size: 28px;
    }

    .loading, .error, .no-data {
      text-align: center;
      padding: 20px;
      font-size: 18px;
    }

    .error {
      color: #e74c3c;
      background-color: #fadbd8;
      border-radius: 8px;
      border: 1px solid #f1948a;
    }

    .success {
      color: #27ae60;
      background-color: #d5f4e6;
      border-radius: 8px;
      border: 1px solid #7dcea0;
      text-align: center;
      padding: 20px;
      font-size: 18px;
      margin-bottom: 20px;
    }

    .no-data {
      color: #f39c12;
      background-color: #fef9e7;
      border-radius: 8px;
      border: 1px solid #f7dc6f;
    }

   .table-container {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .results-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    .results-table th {
       background-color: #34495e;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }

    .results-table td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
    }

    .result-row {
      transition: background-color 0.2s;
      cursor: pointer;
    }

    .result-row:hover {
      background-color: #f8fafc;
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .sample-id {
      font-weight: 600;
      color: #2d3748;
    }

    .patient-name {
      font-weight: 500;
      color: #1a202c;
    }

    .analysis-date {
      color: #4a5568;
      font-size: 13px;
    }

    .status {
      text-align: center;
    }

    .status-normal {
      background-color: #c6f6d5;
      color: #22543d;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .status-abnormal {
      background-color: #fed7d7;
      color: #742a2a;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .patient-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .patient-id {
      font-weight: 500;
      color: #2d3748;
      font-size: 13px;
    }

    .patient-age {
      color: #718096;
      font-size: 12px;
    }

    .sample-type {
      color: #4a5568;
      font-size: 13px;
    }

    .actions {
      text-align: center;
      white-space: nowrap;
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

    .delete-btn {
      background-color: #e74c3c;
      color: white;
    }

    .delete-btn:hover {
      background-color: #c0392b;
      transform: translateY(-1px);
    }

    .pdf-btn {
      background-color: #34495e;
      color: white;
    }

    .pdf-btn:hover {
      background-color: #2c3e50;
      transform: translateY(-1px);
    }

    .action-btn:active {
      transform: translateY(0);
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
      padding: 20px;
      background-color: #f8fafc;
    }

    .pagination-btn, .page-btn {
      padding: 8px 16px;
      border: 1px solid #e2e8f0;
      background: white;
      color: #4a5568;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .pagination-btn:hover:not(:disabled), .page-btn:hover {
      background-color: #667eea;
      color: white;
      border-color: #667eea;
    }

    .pagination-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-numbers {
      display: flex;
      gap: 5px;
    }

    .page-btn.active {
      background-color: #667eea;
      color: white;
      border-color: #667eea;
    }

    .results-summary {
      padding: 15px 20px;
      background-color: #f1f5f9;
      color: #64748b;
      text-align: center;
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .container {
        padding: 10px;
      }
      
      h1 {
        font-size: 2rem;
      }
      
      .results-table {
        font-size: 12px;
      }
      
      .results-table th,
      .results-table td {
        padding: 8px 6px;
      }
      
      .pagination {
        flex-wrap: wrap;
        gap: 5px;
      }
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 900px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #e2e8f0;
      background-color: #f8fafc;
      border-radius: 12px 12px 0 0;
    }

    .modal-header h3 {
      margin: 0;
      color: #2d3748;
      font-size: 1.5rem;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #718096;
      padding: 0;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background-color: #e2e8f0;
      color: #4a5568;
    }

    .modal-body {
      padding: 24px;
    }

    .result-info {
      margin-bottom: 30px;
    }

    .result-info h4, .parameters-section h4 {
      color: #2d3748;
      margin-bottom: 16px;
      font-size: 1.2rem;
      border-bottom: 2px solid #3182ce;
      padding-bottom: 8px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
    }

    .info-item label {
      font-weight: 600;
      color: #4a5568;
      margin-bottom: 4px;
      font-size: 0.9rem;
    }

    .info-item span {
      color: #2d3748;
      font-weight: 500;
    }

    .form-control {
      padding: 8px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 14px;
      transition: border-color 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: #3182ce;
      box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
    }

    .form-control.small {
      padding: 4px 8px;
      font-size: 12px;
    }

    .parameters-section {
      margin-top: 30px;
    }

    .parameters-table {
      overflow-x: auto;
    }

    .parameters-table table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
    }

    .parameters-table th,
    .parameters-table td {
      padding: 12px 8px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }

    .parameters-table th {
      background-color: #f7fafc;
      font-weight: 600;
      color: #4a5568;
      font-size: 0.9rem;
    }

    .parameters-table td {
      color: #2d3748;
    }

    .readonly-field {
      background-color: #f7fafc;
      color: #4a5568;
      font-style: italic;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-normal {
      background-color: #c6f6d5;
      color: #22543d;
    }

    .status-high {
      background-color: #fed7d7;
      color: #c53030;
    }

    .status-low {
      background-color: #fef5e7;
      color: #d69e2e;
    }

    .status-critical {
      background-color: #feb2b2;
      color: #9b2c2c;
    }

    .status-unknown {
      background-color: #e2e8f0;
      color: #4a5568;
    }

    .editable-indicator {
      color: #48bb78;
      font-size: 12px;
      margin-left: 4px;
    }

    .readonly-indicator {
      color: #a0aec0;
      font-size: 12px;
      margin-left: 4px;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 20px 24px;
      border-top: 1px solid #e2e8f0;
      background-color: #f8fafc;
      border-radius: 0 0 12px 12px;
    }

    .btn-primary, .btn-secondary, .btn-debug {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background-color: #3182ce;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background-color: #2c5aa0;
    }

    .btn-primary:disabled {
      background-color: #a0aec0;
      cursor: not-allowed;
    }

    .btn-secondary {
      background-color: #e2e8f0;
      color: #4a5568;
    }

    .btn-secondary:hover {
      background-color: #cbd5e0;
    }

    .btn-debug {
      background-color: #805ad5;
      color: white;
      margin-right: auto;
    }

    .btn-debug:hover {
      background-color: #6b46c1;
    }
  `]
})
export class LabResultsComponent implements OnInit {
  labResults: LabResult[] = [];
  paginatedResults: LabResult[] = [];
  loading = true;
  error: string | null = null;
  currentPage = 1;
  pageSize = 4;
  totalPages = 0;

  // Propiedades para edición
  showEditModal = false;
  editingResult: LabResult | null = null;
  saving = false;
  successMessage: string | null = null;

  constructor(
    private labResultService: LabResultService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private pdfDymindService: PdfDymindDh36Service,
    private pdfIChromaService: PdfIchromaService,
    private pdfUrineService: PdfUrineTestService,
    private pdfStoolService: PdfStoolTestService
  ) {}

  ngOnInit(): void {
    this.loadLabResults();
  }

  loadLabResults(): void {
    console.log('Loading lab results...');
    this.loading = true;
    this.error = null;
    
    this.labResultService.getLabResults().subscribe({
      next: (results) => {
        console.log('Lab results loaded successfully:', results);
        console.log('Results length:', results.length);
        this.labResults = results;
        console.log('this.labResults after assignment:', this.labResults);
        console.log('this.labResults.length:', this.labResults.length);
        this.calculatePagination();
        this.updatePaginatedResults();
        console.log('Pagination calculated. Total pages:', this.totalPages);
        console.log('Paginated results:', this.paginatedResults);
        this.loading = false;
        console.log('Loading set to false');
        this.cdr.detectChanges(); // Force change detection
        console.log('Change detection triggered');
      },
      error: (err) => {
        console.error('Error loading lab results:', err);
        this.error = 'No se pudieron cargar los resultados del laboratorio. Verifica que el backend esté ejecutándose.';
        this.loading = false;
        this.cdr.detectChanges(); // Force change detection
      }
    });
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.labResults.length / this.pageSize);
  }

  updatePaginatedResults(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedResults = this.labResults.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedResults();
    }
  }

  getPageNumbers(): number[] {
    const pageNumbers: number[] = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  }

  getPaginationStart(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getPaginationEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.labResults.length);
  }

  navigateToDetail(sampleNumber: string): void {
    console.log('Navigating to detail for sample number:', sampleNumber);
    this.router.navigate(['/lab-result', sampleNumber]);
  }

  async generatePdf(sampleNumber: string, event: Event): Promise<void> {
    event.stopPropagation(); // Evita que se ejecute el click de la fila
    
    console.log('Generating PDF for sample number:', sampleNumber);
    
    this.labResultService.getLabResultBySampleNumber(sampleNumber).subscribe({
      next: async (result) => {
        try {
          await this.generateLabResultPdf(result);
        } catch (error) {
          console.error('Error generating PDF:', error);
          alert('Error al generar el PDF');
        }
      },
      error: (err) => {
        console.error('Error loading lab result for PDF:', err);
        alert('Error al cargar el resultado para generar el PDF');
      }
    });
  }

  private async generateLabResultPdf(result: any): Promise<void> {
    // Determinar el tipo de resultado y usar el servicio correspondiente
    if (result.parameters && Array.isArray(result.parameters)) {
      // Es un resultado de Dymind DH36
      await this.pdfDymindService.generatePdf(result);
    } else if (result.testResults && Array.isArray(result.testResults)) {
      // Es un resultado de iChroma
      await this.pdfIChromaService.generatePdf(result);
    } else if (result.parameters && result.ph !== undefined) {
      // Es un resultado de análisis de orina
      await this.pdfUrineService.generateUrineReport(result);
    } else if (result.color || result.consistency) {
      // Es un resultado de análisis de heces
      await this.pdfStoolService.generateStoolReport(result);
    } else {
      throw new Error('Tipo de resultado no reconocido para generar PDF');
    }
  }

  getPatientName(result: LabResult): string {
    return result.patientName || 'N/A';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusClass(result: LabResult): string {
    if (!result.parameters || result.parameters.length === 0) {
      return 'status-normal';
    }
    const hasAbnormal = result.parameters.some(p => 
      p.status && (p.status.includes('H') || p.status.includes('L') || p.status.includes('A'))
    );
    return hasAbnormal ? 'status-abnormal' : 'status-normal';
  }

  getStatusText(result: LabResult): string {
    if (!result.parameters || result.parameters.length === 0) {
      return 'Sin parámetros';
    }
    const hasAbnormal = result.parameters.some(p => 
      p.status && (p.status.includes('H') || p.status.includes('L') || p.status.includes('A'))
    );
    return hasAbnormal ? 'Anormal' : 'Normal';
  }

  editLabResult(result: LabResult, event: Event): void {
    event.stopPropagation(); // Evita que se ejecute el click de la fila
    
    // Limpiar mensajes anteriores
    this.error = null;
    this.successMessage = null;
    
    // Crear una copia profunda del resultado para editar
    this.editingResult = JSON.parse(JSON.stringify(result));
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingResult = null;
    this.saving = false;
  }

  async saveLabResult(): Promise<void> {
    if (!this.editingResult) {
      return;
    }

    this.saving = true;

    try {
      console.log('=== DEBUG: Enviando al backend ===');
      console.log('ID:', this.editingResult.id);
      console.log('Datos completos:', this.editingResult);
      
      const updatedResult = await this.labResultService.updateLabResult(
        this.editingResult.id, 
        this.editingResult
      ).toPromise();

      console.log('=== DEBUG: Respuesta del backend ===');
      console.log('Resultado completo:', updatedResult);
      console.log('Parámetros recibidos:', updatedResult?.parameters);
      if (updatedResult?.parameters) {
        console.log('Primer parámetro ejemplo:', updatedResult.parameters[0]);
      }

      // Actualizar el resultado en la lista local
      const index = this.labResults.findIndex(r => r.id === this.editingResult!.id);
      if (index !== -1) {
        this.labResults[index] = updatedResult!;
        this.updatePaginatedResults();
      }

      // Cerrar el modal
      this.closeEditModal();

      // Mostrar mensaje de éxito
      this.successMessage = 'Resultado de laboratorio actualizado correctamente';
      setTimeout(() => {
        this.successMessage = null;
      }, 5000);

    } catch (error: any) {
      console.error('Error updating lab result:', error);
      this.error = error.message || 'Error al actualizar el resultado de laboratorio. Inténtalo de nuevo.';
      this.saving = false;
    }
  }

  debugData(): void {
    if (!this.editingResult) return;
    
    console.log('=== DEBUG: Datos originales ===');
    console.log(JSON.stringify(this.editingResult, null, 2));
    
    // Usar la misma lógica de limpieza que el servicio
    const cleaned: any = { ...this.editingResult };
    
    // Remover campos que no deben ser actualizados
    delete cleaned.id;
    delete cleaned.createdAt;
    delete cleaned.updatedAt;
    delete cleaned.instrumentId;
    delete cleaned.rawData;
    delete cleaned.processingStatus;

    // Limpiar campos vacíos
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] === '' || cleaned[key] === null || cleaned[key] === undefined) {
        delete cleaned[key];
      }
    });

    // Limpiar parámetros - solo enviar name y result
    if (cleaned.parameters && Array.isArray(cleaned.parameters)) {
      cleaned.parameters = cleaned.parameters.map((param: any) => ({
        name: param.name || '',
        result: param.result || ''
        // El backend recalculará automáticamente: status, unit, referenceRange
      }));
    }
    
    console.log('=== DEBUG: Datos que se enviarán ===');
    console.log(JSON.stringify(cleaned, null, 2));
    
    alert('Revisa la consola del navegador para ver los datos que se enviarán al backend');
  }

  deleteLabResult(id: number): void {
    if (!confirm('¿Estás seguro de que deseas eliminar este resultado de laboratorio?')) {
      return;
    }

    this.labResultService.deleteLabResult(id).subscribe({
      next: () => {
        // Eliminar del array local
        this.labResults = this.labResults.filter(r => r.id !== id);
        this.updatePaginatedResults();
        
        // Mostrar mensaje de éxito
        this.successMessage = 'Resultado de laboratorio eliminado correctamente';
        setTimeout(() => {
          this.successMessage = null;
        }, 5000);
      },
      error: (err) => {
        console.error('Error al eliminar resultado:', err);
        this.error = err.message || 'Error al eliminar el resultado de laboratorio. Inténtalo de nuevo.';
      }
    });
  }

  getParameterStatusClass(status: string): string {
    if (!status) return 'status-unknown';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('normal') || statusLower === 'n') return 'status-normal';
    if (statusLower.includes('high') || statusLower.includes('h') || statusLower.includes('alto')) return 'status-high';
    if (statusLower.includes('low') || statusLower.includes('l') || statusLower.includes('bajo')) return 'status-low';
    if (statusLower.includes('critical') || statusLower.includes('critico') || statusLower.includes('crítico')) return 'status-critical';
    
    return 'status-unknown';
  }

  getParameterStatusText(status: string): string {
    if (!status) return 'Sin estado';
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('normal') || statusLower === 'n') return 'Normal';
    if (statusLower.includes('high') || statusLower.includes('h') || statusLower.includes('alto')) return 'Alto';
    if (statusLower.includes('low') || statusLower.includes('l') || statusLower.includes('bajo')) return 'Bajo';
    if (statusLower.includes('critical') || statusLower.includes('critico') || statusLower.includes('crítico')) return 'Crítico';
    
    return status; // Devolver el estado original si no coincide con ningún patrón
  }
}