import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LabResult, Parameter } from '../../../models/lab-result.interface';
import { LabResultService } from '../../../services/lab-result.service';
import { PdfDymindDh36Service, PdfIchromaService, PdfUrineTestService, PdfStoolTestService } from '../../../services/pdf';
import { ChartService } from '../../../services/chart.service';
import { Chart, ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-lab-result-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="header">
        <div class="header-left">
          <button class="back-button" (click)="goBack()">
            ← Volver a la lista
          </button>
          <h1>Resultado de Laboratorio</h1>
        </div>
        <button class="pdf-button" (click)="generatePdf()" *ngIf="labResult && !loading && !error">
          📄 Descargar PDF
        </button>
      </div>

      <div *ngIf="loading" class="loading">
        Cargando detalles...
      </div>

      <div *ngIf="error" class="error">
        Error al cargar el resultado: {{ error }}
      </div>

      <div *ngIf="labResult && !loading && !error" class="lab-report">
        <!-- Header Section - Similar to lab instrument -->
        <div class="report-header">
          <div class="header-row">
            <div class="field-group">
              <label>ID Muestra</label>
              <span class="sample-id">{{ labResult.sampleNumber }}</span>
            </div>
            <div class="field-group">
              <label>Modo</label>
              <span>{{ getShortMode(labResult.analysisMode || '') }}</span>
            </div>
            <div class="field-group">
              <label>Edad</label>
              <span>{{ labResult.patientAge || 'N/A' }}Año</span>
            </div>
          </div>
          <div class="header-row">
            <div class="field-group wide">
              <label>Nombre</label>
              <span>{{ labResult.patientName || 'Sin información de paciente' }}</span>
            </div>
            <div class="field-group">
              <label>Hora de análisis</label>
              <span>{{ formatDateTime(labResult.testDate) }}</span>
            </div>
            <div class="field-group">
              <label>Género</label>
              <span>{{ labResult.patientSex || 'N/A' }}</span>
            </div>
          </div>
        </div>

        <!-- Parameters Table -->
        <div class="parameters-section">
          <div class="parameters-grid">
            <!-- Left Column -->
            <div class="parameters-column">
              <table class="parameters-table">
                <thead>
                  <tr>
                    <th>Param.</th>
                    <th>Resultado</th>
                    <th>Unidad</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let param of getLeftColumnParams()" 
                      [class]="getParameterRowClass(param.status)">
                    <td class="param-name">{{ getParameterShortName(param.name) }}</td>
                    <td class="param-result">{{ param.result }}</td>
                    <td class="param-unit">{{ param.unit }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Right Column -->
            <div class="parameters-column">
              <table class="parameters-table">
                <thead>
                  <tr>
                    <th>Param.</th>
                    <th>Resultado</th>
                    <th>Unidad</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let param of getRightColumnParams()" 
                      [class]="getParameterRowClass(param.status)">
                    <td class="param-name">{{ getParameterShortName(param.name) }}</td>
                    <td class="param-result">{{ param.result }}</td>
                    <td class="param-unit">{{ param.unit }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Additional Parameters if any -->
          <div class="additional-params" *ngIf="getAdditionalParams().length > 0">
            <h3>Parámetros Adicionales</h3>
            <table class="parameters-table full-width">
              <thead>
                <tr>
                  <th>Parámetro</th>
                  <th>Resultado</th>
                  <th>Unidad</th>
                  <th>Rango de Referencia</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let param of getAdditionalParams()" 
                    [class]="getParameterRowClass(param.status)">
                  <td>{{ getParameterDisplayName(param.name) }}</td>
                  <td class="param-result">{{ param.result }}</td>
                  <td>{{ param.unit }}</td>
                  <td>{{ param.referenceRange || 'N/A' }}</td>
                  <td>
                    <span class="status-indicator" [class]="getParameterStatusClass(param.status)">
                      {{ getStatusDisplayText(param.status) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="charts-section" *ngIf="labResult.parameters">
          <h2>Análisis Gráfico</h2>
          <div class="charts-grid">
            <!-- Serie Blanca (WBC) Chart -->
            <div class="chart-container" *ngIf="chartService.hasWBCData(labResult.parameters)">
              <canvas #wbcChart width="400" height="300"></canvas>
            </div>
            
            <!-- Serie Roja (RBC) Chart -->
            <div class="chart-container" *ngIf="chartService.hasRBCData(labResult.parameters)">
              <canvas #rbcChart width="400" height="300"></canvas>
            </div>
            
            <!-- Plaquetas (PLT) Chart -->
            <div class="chart-container" *ngIf="chartService.hasPLTData(labResult.parameters)">
              <canvas #pltChart width="400" height="300"></canvas>
            </div>
          </div>
        </div>

        <!-- Summary Section -->
        <div class="summary-section">
          <div class="summary-stats">
            <div class="stat-box normal">
              <span class="stat-number">{{ getNormalCount() }}</span>
              <span class="stat-label">Normales</span>
            </div>
            <div class="stat-box abnormal">
              <span class="stat-number">{{ getAbnormalCount() }}</span>
              <span class="stat-label">Anómalos</span>
            </div>
            <div class="stat-box total">
              <span class="stat-number">{{ labResult.parameters.length || 0 }}</span>
              <span class="stat-label">Total</span>
            </div>
          </div>
          
          <div class="instrument-info">
            <p><strong>Instrumento:</strong> {{ labResult.instrumentId }}</p>
            <p><strong>Estado:</strong> {{ labResult.processingStatus }}</p>
            <p><strong>Procesado:</strong> {{ formatDateTime(labResult.createdAt) }}</p>
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
      align-items: center;
      justify-content: space-between;
      margin-bottom: 30px;
      gap: 20px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .back-button {
      background: #3498db;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.2s;
    }

    .back-button:hover {
      background: #2980b9;
    }

    .pdf-button {
      background: #e74c3c;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .pdf-button:hover {
      background: #c0392b;
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .pdf-button:active {
      transform: translateY(0);
    }

    h1 {
      color: #2c3e50;
      margin: 0;
      font-size: 2em;
    }

    .loading, .error {
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

    .lab-report {
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .report-header {
      background: #f8f9fa;
      padding: 20px;
      border-bottom: 2px solid #dee2e6;
    }

    .header-row {
      display: flex;
      gap: 30px;
      margin-bottom: 15px;
      align-items: flex-end;
    }

    .header-row:last-child {
      margin-bottom: 0;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      min-width: 120px;
    }

    .field-group.wide {
      flex: 1;
      min-width: 300px;
    }

    .field-group label {
      font-size: 12px;
      font-weight: 600;
      color: #6c757d;
      margin-bottom: 2px;
      text-transform: uppercase;
    }

    .field-group span {
      font-size: 14px;
      font-weight: 500;
      color: #212529;
      padding: 4px 8px;
      background: white;
      border: 1px solid #ced4da;
      border-radius: 3px;
    }

    .sample-id {
      background: #e3f2fd !important;
      color: #1976d2 !important;
      font-weight: bold !important;
    }

    .parameters-section {
      padding: 20px;
    }

    .parameters-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 30px;
    }

    .parameters-column {
      background: #f8f9fa;
      border-radius: 8px;
      overflow: hidden;
    }

    .parameters-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    .parameters-table th {
      background: #495057;
      color: white;
      padding: 8px 12px;
      text-align: left;
      font-weight: 600;
      font-size: 12px;
    }

    .parameters-table td {
      padding: 6px 12px;
      border-bottom: 1px solid #dee2e6;
      background: white;
    }

    .param-name {
      font-weight: 500;
      color: #495057;
    }

    .param-result {
      font-weight: bold;
      color: #212529;
      text-align: right;
    }

    .param-unit {
      color: #6c757d;
      font-size: 11px;
    }

    .parameters-table tr.status-high {
      background-color: #fff5f5 !important;
    }

    .parameters-table tr.status-high td {
      background-color: #fff5f5 !important;
      border-left: 3px solid #e74c3c;
    }

    .parameters-table tr.status-low {
      background-color: #fff8e1 !important;
    }

    .parameters-table tr.status-low td {
      background-color: #fff8e1 !important;
      border-left: 3px solid #f39c12;
    }

    .additional-params {
      margin-top: 30px;
    }

    .additional-params h3 {
      color: #495057;
      margin-bottom: 15px;
      font-size: 16px;
    }

    .full-width {
      width: 100%;
      background: #f8f9fa;
      border-radius: 8px;
      overflow: hidden;
    }

    .status-indicator {
      padding: 2px 6px;
      border-radius: 8px;
      font-size: 10px;
      font-weight: bold;
      text-transform: uppercase;
    }

    .status-indicator.status-high {
      background-color: #fadbd8;
      color: #c0392b;
    }

    .status-indicator.status-low {
      background-color: #fdeaa7;
      color: #d68910;
    }

    .status-indicator.status-normal {
      background-color: #d5f4e6;
      color: #229954;
    }

    .summary-section {
      background: #f8f9fa;
      padding: 20px;
      border-top: 1px solid #dee2e6;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .summary-stats {
      display: flex;
      gap: 20px;
    }

    .stat-box {
      text-align: center;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      min-width: 80px;
    }

    .stat-box.normal {
      background-color: #d5f4e6;
      color: #27ae60;
    }

    .stat-box.abnormal {
      background-color: #fadbd8;
      color: #e74c3c;
    }

    .stat-box.total {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .stat-number {
      display: block;
      font-size: 1.8em;
      font-weight: bold;
      line-height: 1;
    }

    .stat-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      margin-top: 5px;
    }

    .instrument-info {
      text-align: right;
      color: #6c757d;
      font-size: 13px;
    }

    .instrument-info p {
      margin: 2px 0;
    }

    @media (max-width: 1200px) {
      .parameters-grid {
        grid-template-columns: 1fr;
        gap: 20px;
      }
    }

    @media (max-width: 768px) {
      .header-row {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
      }

      .field-group {
        min-width: auto;
      }

      .summary-section {
        flex-direction: column;
        gap: 20px;
        text-align: center;
      }

      .summary-stats {
        justify-content: center;
      }

      .charts-grid {
        flex-direction: column;
        gap: 20px;
      }

      .chart-container {
        width: 100%;
        height: 250px;
      }
    }

    /* Charts Section Styles */
    .charts-section {
      margin: 30px 0;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .charts-section h2 {
      margin: 0 0 20px 0;
      font-size: 18px;
      font-weight: bold;
      color: #1f2937;
      text-align: center;
      border-bottom: 2px solid #3b82f6;
      padding-bottom: 10px;
    }

    .charts-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      justify-content: center;
    }

    .chart-container {
      flex: 1;
      min-width: 300px;
      max-width: 400px;
      height: 300px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 15px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .chart-container canvas {
      max-width: 100%;
      max-height: 100%;
    }
  `]
})
export class LabResultDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  labResult: LabResult | null = null;
  loading = true;
  error: string | null = null;

  // Referencias a los canvas de los gráficos
  @ViewChild('wbcChart', { static: false }) wbcChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('rbcChart', { static: false }) rbcChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('pltChart', { static: false }) pltChartRef!: ElementRef<HTMLCanvasElement>;

  // Instancias de los gráficos
  wbcChart: Chart | null = null;
  rbcChart: Chart | null = null;
  pltChart: Chart | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private labResultService: LabResultService,
    private pdfDymindService: PdfDymindDh36Service,
    private pdfIChromaService: PdfIchromaService,
    private pdfUrineService: PdfUrineTestService,
    private pdfStoolService: PdfStoolTestService,
    public chartService: ChartService
  ) {}

  ngOnInit(): void {
    const sampleNumber = this.route.snapshot.paramMap.get('sampleNumber');
    if (sampleNumber) {
      this.loadLabResult(sampleNumber);
    } else {
      this.error = 'Número de muestra no válido';
      this.loading = false;
    }
  }

  ngAfterViewInit(): void {
    // Los gráficos se crearán después de que los datos se carguen
  }

  loadLabResult(sampleNumber: string): void {
    this.labResultService.getLabResultBySampleNumber(sampleNumber).subscribe({
      next: (result) => {
        this.labResult = result;
        this.loading = false;
        // Crear gráficos después de cargar los datos
        setTimeout(() => this.createCharts(), 100);
      },
      error: (err) => {
        this.error = 'No se pudo cargar el resultado del laboratorio';
        this.loading = false;
        console.error('Error loading lab result:', err);
      }
    });
  }

  createCharts(): void {
    if (!this.labResult?.parameters) return;

    this.destroyExistingCharts();

    // Crear gráfico WBC
    if (this.chartService.hasWBCData(this.labResult.parameters) && this.wbcChartRef) {
      const wbcConfig = this.chartService.createWBCChart(this.labResult.parameters);
      this.wbcChart = new Chart(this.wbcChartRef.nativeElement, wbcConfig);
    }

    // Crear gráfico RBC
    if (this.chartService.hasRBCData(this.labResult.parameters) && this.rbcChartRef) {
      const rbcConfig = this.chartService.createRBCChart(this.labResult.parameters);
      this.rbcChart = new Chart(this.rbcChartRef.nativeElement, rbcConfig);
    }

    // Crear gráfico PLT
    if (this.chartService.hasPLTData(this.labResult.parameters) && this.pltChartRef) {
      const pltConfig = this.chartService.createPLTChart(this.labResult.parameters);
      this.pltChart = new Chart(this.pltChartRef.nativeElement, pltConfig);
    }
  }

  destroyExistingCharts(): void {
    if (this.wbcChart) {
      this.wbcChart.destroy();
      this.wbcChart = null;
    }
    if (this.rbcChart) {
      this.rbcChart.destroy();
      this.rbcChart = null;
    }
    if (this.pltChart) {
      this.pltChart.destroy();
      this.pltChart = null;
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  async generatePdf(): Promise<void> {
    if (this.labResult) {
      try {
        console.log('Generating PDF for lab result:', this.labResult.sampleNumber);
        await this.generateLabResultPdf(this.labResult);
      } catch (error) {
        console.error('Error generating PDF:', error);
        // Aquí podrías mostrar un mensaje de error al usuario si lo deseas
      }
    }
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

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  }

  getShortMode(analysisMode: string): string {
    if (!analysisMode) {
      return 'N/A';
    }
    
    const modeMap: { [key: string]: string } = {
      'Automated Count': 'VVB',
      'Manual Count': 'Manual',
      'CBC': 'CBC'
    };
    return modeMap[analysisMode] || analysisMode.substring(0, 8);
  }

  getParameterDisplayName(name: string): string {
    if (!name) return 'N/A';
    const parts = name.split('^');
    return parts.length > 1 ? parts[1] : parts[0];
  }

  getParameterShortName(name: string): string {
    if (!name) return 'N/A';
    const parts = name.split('^');
    const shortName = parts.length > 1 ? parts[1] : parts[0];
    
    // Map common parameter names to shorter versions
    const shortNameMap: { [key: string]: string } = {
      'Leucocitos': 'WBC',
      'Linfocitos %': 'Lym%',
      'Granulocitos %': 'Gran%',
      'Monocitos %': 'Mid%',
      'Linfocitos': 'Lym#',
      'Granulocitos': 'Gran#',
      'Monocitos': 'Mid#',
      'Eritrocitos': 'RBC',
      'Hemoglobina': 'HGB',
      'Hematocrito': 'HCT',
      'VCM': 'MCV',
      'HCM': 'MCH',
      'CHCM': 'MCHC',
      'RDW-CV': 'RDW-CV',
      'RDW-SD': 'RDW-SD',
      'Plaquetas': 'PLT',
      'VPM': 'MPV',
      'PDW': 'PDW',
      'PCT': 'PCT',
      'P-LCR': 'P-LCR',
      'P-LCC': 'P-LCC'
    };
    
    return shortNameMap[shortName] || (shortName ? shortName.substring(0, 8) : 'N/A');
  }

  getParameterStatusClass(status: string): string {
    if (!status) return 'status-normal';
    if (status.includes('H')) return 'status-high';
    if (status.includes('L')) return 'status-low';
    return 'status-normal';
  }

  getParameterRowClass(status: string): string {
    if (!status) return 'status-normal';
    if (status.includes('H')) return 'status-high';
    if (status.includes('L')) return 'status-low';
    return 'status-normal';
  }

  getStatusDisplayText(status: string): string {
    if (!status) return 'Normal';
    if (status.includes('H')) return 'Alto';
    if (status.includes('L')) return 'Bajo';
    if (status === 'N' || status === '~N' || status === '') return 'Normal';
    return status || 'Normal';
  }

  getLeftColumnParams(): Parameter[] {
    if (!this.labResult || !this.labResult.parameters || this.labResult.parameters.length === 0) return [];
    // First half of parameters
    const halfLength = Math.ceil(this.labResult.parameters.length / 2);
    return this.labResult.parameters.slice(0, halfLength);
  }

  getRightColumnParams(): Parameter[] {
    if (!this.labResult || !this.labResult.parameters || this.labResult.parameters.length === 0) return [];
    // Second half of parameters
    const halfLength = Math.ceil(this.labResult.parameters.length / 2);
    return this.labResult.parameters.slice(halfLength);
  }

  getAdditionalParams(): Parameter[] {
    if (!this.labResult || !this.labResult.parameters || this.labResult.parameters.length === 0) return [];
    // For now, return empty array. Can be used for parameters that don't fit in the main columns
    return [];
  }

  getNormalCount(): number {
    if (!this.labResult || !this.labResult.parameters || this.labResult.parameters.length === 0) return 0;
    return this.labResult.parameters.filter((p: Parameter) => 
      p.status === 'N' || p.status === '~N' || p.status === ''
    ).length;
  }

  getAbnormalCount(): number {
    if (!this.labResult || !this.labResult.parameters || this.labResult.parameters.length === 0) return 0;
    return this.labResult.parameters.filter((p: Parameter) => 
      p.status && (p.status.includes('H') || p.status.includes('L') || p.status.includes('A'))
    ).length;
  }

  ngOnDestroy(): void {
    this.destroyExistingCharts();
  }
}