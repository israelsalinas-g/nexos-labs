import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DymindDh36Result, Parameter } from '../../../models/dymind-dh36-result.interface';
import { DymindDh36ResultService } from '../../../services/dymind-dh36-result.service';
import { PdfDymindDh36Service } from '../../../services/pdf/pdf-dymind-dh36.service';
import { ChartService } from '../../../services/chart.service';
import { Chart, ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-lab-result-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dymind-dh36-result-detail.component.html',
  styleUrls: ['./dymind-dh36-result-detail.component.css']
})
export class DymindDh36ResultDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  dymindDh36Result: DymindDh36Result | null = null;
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
    private dymindDh36ResultService: DymindDh36ResultService,
    private pdfService: PdfDymindDh36Service,
    public chartService: ChartService
  ) {}

  ngOnInit(): void {
    const sampleNumber = this.route.snapshot.paramMap.get('sampleNumber');
    if (sampleNumber) {
      this.loaddymindDh36Result(sampleNumber);
    } else {
      this.error = 'Número de muestra no válido';
      this.loading = false;
    }
  }

  ngAfterViewInit(): void {
    // Los gráficos se crearán después de que los datos se carguen
  }

  loaddymindDh36Result(sampleNumber: string): void {
    this.dymindDh36ResultService.getDymindDh36ResultBySampleNumber(sampleNumber).subscribe({
      next: (result) => {
        this.dymindDh36Result = result;
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
    if (!this.dymindDh36Result?.parameters) return;

    this.destroyExistingCharts();

    // Crear gráfico WBC
    if (this.chartService.hasWBCData(this.dymindDh36Result.parameters) && this.wbcChartRef) {
      const wbcConfig = this.chartService.createWBCChart(this.dymindDh36Result.parameters);
      this.wbcChart = new Chart(this.wbcChartRef.nativeElement, wbcConfig);
    }

    // Crear gráfico RBC
    if (this.chartService.hasRBCData(this.dymindDh36Result.parameters) && this.rbcChartRef) {
      const rbcConfig = this.chartService.createRBCChart(this.dymindDh36Result.parameters);
      this.rbcChart = new Chart(this.rbcChartRef.nativeElement, rbcConfig);
    }

    // Crear gráfico PLT
    if (this.chartService.hasPLTData(this.dymindDh36Result.parameters) && this.pltChartRef) {
      const pltConfig = this.chartService.createPLTChart(this.dymindDh36Result.parameters);
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
    if (this.dymindDh36Result) {
      try {
        console.log('Generating PDF for Dymind DH36 with charts:', this.dymindDh36Result.sampleNumber);
        await this.pdfService.generatePdf(this.dymindDh36Result);
      } catch (error) {
        console.error('Error generating Dymind DH36 PDF:', error);
        // Aquí podrías mostrar un mensaje de error al usuario si lo deseas
      }
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
    if (!this.dymindDh36Result || !this.dymindDh36Result.parameters || this.dymindDh36Result.parameters.length === 0) return [];
    // First half of parameters
    const halfLength = Math.ceil(this.dymindDh36Result.parameters.length / 2);
    return this.dymindDh36Result.parameters.slice(0, halfLength);
  }

  getRightColumnParams(): Parameter[] {
    if (!this.dymindDh36Result || !this.dymindDh36Result.parameters || this.dymindDh36Result.parameters.length === 0) return [];
    // Second half of parameters
    const halfLength = Math.ceil(this.dymindDh36Result.parameters.length / 2);
    return this.dymindDh36Result.parameters.slice(halfLength);
  }

  getAdditionalParams(): Parameter[] {
    if (!this.dymindDh36Result || !this.dymindDh36Result.parameters || this.dymindDh36Result.parameters.length === 0) return [];
    // For now, return empty array. Can be used for parameters that don't fit in the main columns
    return [];
  }

  getNormalCount(): number {
    if (!this.dymindDh36Result || !this.dymindDh36Result.parameters || this.dymindDh36Result.parameters.length === 0) return 0;
    return this.dymindDh36Result.parameters.filter((p: Parameter) => 
      p.status === 'N' || p.status === '~N' || p.status === ''
    ).length;
  }

  getAbnormalCount(): number {
    if (!this.dymindDh36Result || !this.dymindDh36Result.parameters || this.dymindDh36Result.parameters.length === 0) return 0;
    return this.dymindDh36Result.parameters.filter((p: Parameter) => 
      p.status && (p.status.includes('H') || p.status.includes('L') || p.status.includes('A'))
    ).length;
  }

  ngOnDestroy(): void {
    this.destroyExistingCharts();
  }
}