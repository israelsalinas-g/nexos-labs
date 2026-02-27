import {
  Component,
  OnInit,
  signal,
  computed,
  viewChild,
  ElementRef,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { PatientHistoryService } from '../../../services/patient-history.service';
import { PatientService } from '../../../services/patient.service';
import {
  PatientHistoryExam,
  PatientHistoryPatient,
  TestTrendPoint,
  ExamTestType,
} from '../../../models/patient-history.interface';
import { Patient } from '../../../models/patient.interface';

Chart.register(...registerables);

const TEST_TYPE_LABELS: Record<string, string> = {
  DH36: 'Hemograma (DH36)',
  ICHROMA: 'iChroma',
  URINE: 'Orina',
  HECES: 'Heces',
  LAB: 'Laboratorio',
};

const STATUS_LABELS: Record<string, string> = {
  completed: 'Completado',
  pending: 'Pendiente',
  processing: 'Procesando',
  failed: 'Error',
  processed: 'Procesado',
};

@Component({
  selector: 'app-patient-history',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="ph-page">
      <!-- Header -->
      <div class="ph-header">
        <button class="btn-back" (click)="goBack()">← Volver</button>
        <h1>Historial de Exámenes</h1>
      </div>

      <!-- Selector de paciente -->
      <div class="ph-card selector-card">
        <h3 class="card-title">Seleccionar Paciente</h3>
        <div class="selector-row">
          <select
            class="patient-select"
            [value]="selectedPatientId()"
            (change)="onPatientChange($event)"
            [disabled]="patients().length === 0">
            <option value="">-- Selecciona un paciente --</option>
            @for (p of patients(); track p.id) {
              <option [value]="p.id">{{ p.name }}</option>
            }
          </select>
          @if (selectedPatientId() && !loading()) {
            <button class="btn-primary" (click)="applyFilters()">Buscar</button>
          }
        </div>
        @if (patients().length === 0) {
          <p class="hint">Cargando lista de pacientes...</p>
        }
      </div>

      <!-- Filtros (visibles solo cuando hay paciente seleccionado) -->
      @if (selectedPatientId()) {
        <div class="ph-card filters-card">
          <span class="filters-label">Filtros:</span>
          <div class="filters-row">
            <div class="filter-group">
              <label>Desde</label>
              <input type="date" class="filter-input" [value]="dateFrom()" (change)="onDateFromChange($event)">
            </div>
            <div class="filter-group">
              <label>Hasta</label>
              <input type="date" class="filter-input" [value]="dateTo()" (change)="onDateToChange($event)">
            </div>
            <div class="filter-group">
              <label>Tipo</label>
              <select class="filter-input" [value]="testTypeFilter()" (change)="onTestTypeChange($event)">
                <option value="">Todos</option>
                <option value="LAB">Laboratorio</option>
                <option value="DH36">Hemograma (DH36)</option>
                <option value="ICHROMA">iChroma</option>
                <option value="URINE">Orina</option>
                <option value="HECES">Heces</option>
              </select>
            </div>
            <button class="btn-secondary" (click)="clearFilters()">Limpiar</button>
          </div>
        </div>
      }

      <!-- Loading / Error -->
      @if (loading()) {
        <div class="state-box"><div class="spinner"></div><p>Cargando historial...</p></div>
      }
      @if (error()) {
        <div class="state-box error-box">
          <p>{{ error() }}</p>
          <button class="btn-secondary" (click)="applyFilters()">Reintentar</button>
        </div>
      }

      <!-- Información del paciente -->
      @if (!loading() && patientData()) {
        <div class="ph-card patient-card">
          <div class="patient-avatar">{{ avatarLetter() }}</div>
          <div class="patient-details">
            <h2 class="patient-name">{{ patientData()!.name }}</h2>
            <div class="patient-meta">
              <span><b>Sexo:</b> {{ getSexLabel(patientData()!.sex) }}</span>
              <span><b>Nacimiento:</b> {{ formatDate(patientData()!.birthDate) }}</span>
              <span><b>Teléfono:</b> {{ patientData()!.phone }}</span>
            </div>
          </div>
          <div class="exam-count-badge">{{ examsData().length }} exámenes</div>
        </div>
      }

      <!-- Panel de tendencia -->
      @if (showTrendPanel()) {
        <div class="ph-card trend-card">
          <div class="trend-header">
            <h3>Tendencia: {{ selectedTrendTest() }}</h3>
            <button class="btn-close" (click)="closeTrend()">✕</button>
          </div>
          @if (trendLoading()) {
            <div class="state-box"><div class="spinner"></div><p>Cargando tendencia...</p></div>
          } @else if (trendPoints().length === 0) {
            <p class="hint">No hay datos suficientes para mostrar la tendencia.</p>
          } @else {
            <canvas #trendCanvas class="trend-canvas"></canvas>
          }
        </div>
      }

      <!-- Tabla de exámenes -->
      @if (!loading() && !error() && examsData().length > 0) {
        <div class="ph-card exams-card">
          <div class="table-wrapper">
            <table class="exams-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Nombre del Examen</th>
                  <th>Muestra</th>
                  <th>Valor</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                @for (exam of examsData(); track exam.id) {
                  <tr
                    [class.row-abnormal]="exam.isAbnormal === true"
                    [class.row-lab]="exam.testType === 'LAB'"
                    (click)="onRowClick(exam)">
                    <td class="td-date">{{ formatDateTime(exam.testDate) }}</td>
                    <td>
                      <span class="type-badge type-{{ exam.testType.toLowerCase() }}">
                        {{ getTypeLabel(exam.testType) }}
                      </span>
                    </td>
                    <td class="td-name">{{ exam.testName }}</td>
                    <td class="td-sample">{{ exam.sampleNumber ?? '—' }}</td>
                    <td class="td-value">
                      @if (exam.numericValue !== undefined) {
                        <span [class.value-abnormal]="exam.isAbnormal === true" [class.value-normal]="exam.isAbnormal === false">
                          {{ exam.numericValue }}
                          @if (exam.isAbnormal === true) { <span class="flag">↑↓</span> }
                        </span>
                      } @else {
                        <span class="muted">—</span>
                      }
                    </td>
                    <td>
                      <span class="status-badge status-{{ exam.status.toLowerCase() }}">
                        {{ getStatusLabel(exam.status) }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          @if (hasLabResults()) {
            <p class="hint trend-hint">💡 Haz clic en una fila de tipo <b>Laboratorio</b> para ver la gráfica de tendencia.</p>
          }
        </div>
      }

      @if (!loading() && !error() && selectedPatientId() && examsData().length === 0) {
        <div class="state-box empty-box">
          <p>No hay exámenes registrados para este paciente con los filtros seleccionados.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .ph-page { padding: 24px; max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px; }

    .ph-header { display: flex; align-items: center; gap: 16px; }
    .ph-header h1 { font-size: 22px; font-weight: 700; margin: 0; color: var(--color-text); }

    .btn-back { background: none; border: 1px solid var(--color-border); padding: 7px 14px; border-radius: 6px; cursor: pointer; font-size: 13px; color: var(--color-text-muted); }
    .btn-back:hover { background: var(--color-surface-alt); }
    .btn-primary { background: var(--color-primary); color: white; border: none; padding: 9px 18px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; }
    .btn-primary:hover { opacity: 0.88; }
    .btn-secondary { background: var(--color-surface-alt); color: var(--color-text); border: 1px solid var(--color-border); padding: 7px 14px; border-radius: 6px; font-size: 13px; cursor: pointer; }
    .btn-secondary:hover { background: var(--color-border); }
    .btn-close { background: none; border: none; font-size: 18px; cursor: pointer; color: var(--color-text-muted); padding: 0; }
    .btn-close:hover { color: var(--color-danger); }

    .ph-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 10px; padding: 20px; }

    .card-title { font-size: 15px; font-weight: 600; margin: 0 0 12px; color: var(--color-text); }

    .selector-row { display: flex; gap: 12px; align-items: center; }
    .patient-select { flex: 1; padding: 9px 12px; border: 1px solid var(--color-border); border-radius: 6px; font-size: 14px; background: var(--color-surface); color: var(--color-text); }
    .patient-select:disabled { opacity: 0.5; }

    .filters-card { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; padding: 14px 20px; }
    .filters-label { font-size: 13px; font-weight: 600; color: var(--color-text-muted); white-space: nowrap; }
    .filters-row { display: flex; gap: 12px; flex-wrap: wrap; flex: 1; align-items: flex-end; }
    .filter-group { display: flex; flex-direction: column; gap: 3px; }
    .filter-group label { font-size: 11px; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; }
    .filter-input { padding: 7px 10px; border: 1px solid var(--color-border); border-radius: 6px; font-size: 13px; background: var(--color-surface); color: var(--color-text); }
    .filter-input:focus { outline: none; border-color: var(--color-primary); }

    .patient-card { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
    .patient-avatar { width: 52px; height: 52px; border-radius: 50%; background: var(--color-primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 700; flex-shrink: 0; }
    .patient-details { flex: 1; }
    .patient-name { font-size: 18px; font-weight: 700; margin: 0 0 6px; color: var(--color-text); }
    .patient-meta { display: flex; gap: 16px; flex-wrap: wrap; font-size: 13px; color: var(--color-text-muted); }
    .exam-count-badge { background: var(--color-surface-alt); border: 1px solid var(--color-border); border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: 600; color: var(--color-text-muted); white-space: nowrap; }

    .trend-card { }
    .trend-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .trend-header h3 { font-size: 15px; font-weight: 600; color: var(--color-text); margin: 0; }
    .trend-canvas { max-height: 280px; }

    .exams-card { padding: 0; overflow: hidden; }
    .table-wrapper { overflow-x: auto; }
    .exams-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .exams-table th { background: var(--color-surface-alt); padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 600; color: var(--color-text-muted); text-transform: uppercase; border-bottom: 1px solid var(--color-border); }
    .exams-table td { padding: 10px 14px; border-bottom: 1px solid var(--color-border); color: var(--color-text); vertical-align: middle; }
    .exams-table tr:last-child td { border-bottom: none; }
    .exams-table tbody tr:hover { background: var(--color-surface-alt); }
    .row-lab { cursor: pointer; }
    .row-abnormal { background: color-mix(in srgb, #ef4444 4%, transparent); }
    .row-abnormal:hover { background: color-mix(in srgb, #ef4444 8%, transparent) !important; }

    .td-date { white-space: nowrap; font-weight: 500; }
    .td-name { font-weight: 500; }
    .td-sample { font-size: 11px; color: var(--color-text-muted); font-family: monospace; }
    .td-value { font-weight: 700; font-size: 14px; }
    .value-abnormal { color: #ef4444; }
    .value-normal { color: #22c55e; }
    .flag { font-size: 10px; margin-left: 2px; }
    .muted { color: var(--color-text-muted); }

    .type-badge { padding: 3px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }
    .type-lab     { background: #dbeafe; color: #1d4ed8; }
    .type-dh36    { background: #f3e8ff; color: #7e22ce; }
    .type-ichroma { background: #fef3c7; color: #92400e; }
    .type-urine   { background: #ecfdf5; color: #065f46; }
    .type-heces   { background: #fff7ed; color: #9a3412; }

    .status-badge { padding: 3px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }
    .status-completed, .status-processed { background: #dcfce7; color: #166534; }
    .status-pending   { background: #fef9c3; color: #854d0e; }
    .status-processing { background: #dbeafe; color: #1d4ed8; }
    .status-failed    { background: #fee2e2; color: #991b1b; }

    .state-box { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 48px 24px; text-align: center; background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 10px; color: var(--color-text-muted); font-size: 14px; }
    .error-box { border-color: var(--color-danger); color: var(--color-danger); }
    .empty-box { }

    .spinner { width: 36px; height: 36px; border: 3px solid var(--color-border); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .hint { font-size: 12px; color: var(--color-text-muted); margin: 12px 16px; }
    .trend-hint { margin-top: 0; padding: 10px 16px; border-top: 1px solid var(--color-border); }

    @media (max-width: 640px) {
      .ph-page { padding: 16px; }
      .selector-row { flex-direction: column; align-items: stretch; }
      .patient-card { flex-direction: column; text-align: center; }
      .patient-meta { justify-content: center; }
    }
  `],
})
export class PatientHistoryComponent implements OnInit {
  private router = inject(Router);
  private historyService = inject(PatientHistoryService);
  private patientService = inject(PatientService);

  // Patient state
  patients = signal<Patient[]>([]);
  selectedPatientId = signal('');

  // History state
  loading = signal(false);
  error = signal<string | null>(null);
  patientData = signal<PatientHistoryPatient | null>(null);
  examsData = signal<PatientHistoryExam[]>([]);

  // Filter state
  dateFrom = signal('');
  dateTo = signal('');
  testTypeFilter = signal('');

  // Trend state
  showTrendPanel = signal(false);
  trendLoading = signal(false);
  selectedTrendTest = signal('');
  trendPoints = signal<TestTrendPoint[]>([]);

  // Chart ref
  trendCanvasRef = viewChild<ElementRef>('trendCanvas');
  private trendChart?: Chart;

  // Computed
  avatarLetter = computed(() => {
    const name = this.patientData()?.name ?? '';
    return name.charAt(0).toUpperCase() || '?';
  });

  hasLabResults = computed(() =>
    this.examsData().some(e => e.testType === 'LAB' && e.testDefinitionId !== undefined)
  );

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.patientService.getPatients().subscribe({
      next: (response: any) => {
        this.patients.set(response.data || response || []);
      },
      error: () => {},
    });
  }

  onPatientChange(event: Event): void {
    const id = (event.target as HTMLSelectElement).value;
    this.selectedPatientId.set(id);
    if (id) this.applyFilters();
  }

  onDateFromChange(event: Event): void {
    this.dateFrom.set((event.target as HTMLInputElement).value);
  }

  onDateToChange(event: Event): void {
    this.dateTo.set((event.target as HTMLInputElement).value);
  }

  onTestTypeChange(event: Event): void {
    this.testTypeFilter.set((event.target as HTMLSelectElement).value);
  }

  applyFilters(): void {
    if (!this.selectedPatientId()) return;
    this.loading.set(true);
    this.error.set(null);
    this.showTrendPanel.set(false);

    this.historyService.getPatientExamsSummary(this.selectedPatientId(), {
      dateFrom: this.dateFrom() || undefined,
      dateTo: this.dateTo() || undefined,
      testType: this.testTypeFilter() || undefined,
    }).subscribe({
      next: (response) => {
        this.patientData.set(response.patient);
        this.examsData.set(response.exams ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el historial. Intenta nuevamente.');
        this.loading.set(false);
      },
    });
  }

  clearFilters(): void {
    this.dateFrom.set('');
    this.dateTo.set('');
    this.testTypeFilter.set('');
    this.applyFilters();
  }

  onRowClick(exam: PatientHistoryExam): void {
    if (exam.testType !== 'LAB' || !exam.testDefinitionId) return;
    this.loadTrend(exam.testName, exam.testDefinitionId);
  }

  loadTrend(testName: string, testDefinitionId: number): void {
    this.selectedTrendTest.set(testName);
    this.showTrendPanel.set(true);
    this.trendLoading.set(true);
    this.trendPoints.set([]);
    if (this.trendChart) { this.trendChart.destroy(); this.trendChart = undefined; }

    this.historyService.getTestTrend(this.selectedPatientId(), testDefinitionId).subscribe({
      next: (points) => {
        this.trendPoints.set(points);
        this.trendLoading.set(false);
        setTimeout(() => this.renderChart(points), 0);
      },
      error: () => {
        this.trendLoading.set(false);
      },
    });
  }

  closeTrend(): void {
    this.showTrendPanel.set(false);
    if (this.trendChart) { this.trendChart.destroy(); this.trendChart = undefined; }
  }

  private renderChart(points: TestTrendPoint[]): void {
    const canvasEl = this.trendCanvasRef()?.nativeElement;
    if (!canvasEl) return;
    if (this.trendChart) { this.trendChart.destroy(); }

    const ctx = canvasEl.getContext('2d');
    const labels = points.map(p =>
      new Date(p.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' })
    );
    const pointColors = points.map(p =>
      p.isAbnormal === true ? '#ef4444' : p.isAbnormal === false ? '#22c55e' : '#6b7280'
    );

    this.trendChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: this.selectedTrendTest(),
          data: points.map(p => p.value),
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79,70,229,0.06)',
          pointBackgroundColor: pointColors,
          pointBorderColor: pointColors,
          pointRadius: 6,
          pointHoverRadius: 8,
          tension: 0.3,
          fill: true,
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              afterLabel: (ctx) => {
                const p = points[ctx.dataIndex];
                return p.isAbnormal === true ? '⚠ Anormal' : p.isAbnormal === false ? '✓ Normal' : '';
              },
            },
          },
        },
        scales: {
          x: { ticks: { font: { size: 11 } }, grid: { display: false } },
          y: { ticks: { font: { size: 11 } } },
        },
      },
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  formatDateTime(date: string): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  }

  getTypeLabel(type: ExamTestType): string {
    return TEST_TYPE_LABELS[type] ?? type;
  }

  getStatusLabel(status: string): string {
    return STATUS_LABELS[status.toLowerCase()] ?? status;
  }

  getSexLabel(sex: string): string {
    return sex === 'M' ? 'Masculino' : sex === 'F' ? 'Femenino' : 'Otro';
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
