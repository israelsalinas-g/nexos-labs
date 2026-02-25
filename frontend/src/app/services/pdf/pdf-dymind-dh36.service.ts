import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PdfBaseService } from './pdf-base.service';
import { ChartService } from '../chart.service';

@Injectable({
  providedIn: 'root'
})
export class PdfDymindDh36Service extends PdfBaseService {
  
  constructor(private chartService: ChartService) { 
    super();
  }

  // ========== CONFIGURACIONES ESPECÍFICAS ==========
  
  private readonly DH36_COLORS = {
    CHART_BACKGROUND: '#f8f9fa',
    HIGH_VALUE: '#e74c3c',
    LOW_VALUE: '#3498db',
    NORMAL_VALUE: '#2ecc71'
  };

  // ========== MÉTODO PRINCIPAL ==========

  async generatePdf(data: any): Promise<void> {
    const doc = new jsPDF();
    
    try {
      console.log('PDF DH36 Service - Datos recibidos:', data);
      console.log('Estructura de datos completa:', JSON.stringify(data, null, 2));
      
      // Convertir a formato LabResult esperado por el código mejorado
      const labResult = this.convertToLabResult(data);
      
      // Verificar si los parámetros se convirtieron correctamente
      const hasValidParameters = labResult.parameters && labResult.parameters.length > 0 && 
        labResult.parameters.some((p: any) => p.result !== 'N/A');
      
      if (!hasValidParameters) {
        console.warn('No se pudieron extraer parámetros válidos, usando método de respaldo');
        // Intentar método de respaldo con estructura original
        await this.generateFallbackPdf(data);
      } else {
        console.log('Parámetros extraídos correctamente, usando método mejorado');
        // Usar el método mejorado con gráficos
        await this.generateLabResultPdf(labResult);
      }
      
    } catch (error) {
      console.error('Error al generar PDF de Dymind DH36:', error);
      throw new Error('Error al generar el reporte PDF de hematología');
    }
  }

  private async generateFallbackPdf(data: any): Promise<void> {
    console.log('Generando PDF con método de respaldo (estructura original)');
    
    const doc = new jsPDF('p', 'mm', 'a4');
    
    let currentY = 20;
    
    // Encabezado institucional
    currentY = this.addInstitutionalHeader(doc, currentY);
    
    // Información del paciente y muestra en tablas lado a lado
    currentY = this.addPatientAndSampleTables(doc, data, currentY);
    
    // Título del examen
    currentY += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    const title = 'HEMOGRAMA COMPLETO - Dymind DH36';
    const titleWidth = doc.getTextWidth(title);
    const centerX = (210 - titleWidth) / 2;
    doc.text(title, centerX, currentY);
    currentY += 15;
    
    // Sección de Parámetros Hematológicos
    currentY = this.addHematologyParametersTable(doc, data, currentY);
    
    // Información del Equipo
    currentY += 10;
    currentY = this.addEquipmentInformationTable(doc, data, currentY);
    
    // Observaciones
    currentY += 10;
    this.addObservationsSection(doc, data, currentY);
    
    // Guardar archivo
    const filename = `Hemograma_${data.patientName?.replace(/\s+/g, '_') || 'Sin_nombre'}_${Date.now()}.pdf`;
    console.log('Guardando PDF DH36 con método de respaldo:', filename);
    doc.save(filename);
  }

  // ========== MÉTODO MEJORADO CON GRÁFICOS ==========

  async generateLabResultPdf(labResult: any): Promise<void> {
    const doc = new jsPDF();
    
    // Configuración de fuentes y colores
    const primaryColor = '#2c3e50';
    
    // Header compacto (0-20)
    this.addCompactHeader(doc, primaryColor);
    
    // Información del paciente y muestra compacta (20-45)
    this.addCompactPatientInfo(doc, labResult, primaryColor);
    
    // Diseño de dos columnas: Tabla (izq) y Gráficos (der)
    await this.addTwoColumnLayout(doc, labResult);
    
    // Generar y descargar el PDF
    const fileName = `Resultado_Lab_${labResult.sampleNumber}_${this.formatDateForFilename(labResult.testDate)}.pdf`;
    doc.save(fileName);
  }

  // ========== CONVERSIÓN DE DATOS ==========

  private convertToLabResult(data: any): any {
    console.log('Converting data to LabResult format:', data);
    
    const labResult = {
      sampleNumber: data.sampleNumber || data.sampleId || data.id?.toString() || 'N/A',
      patientName: data.patientName || 'N/A',
      patientAge: data.patientAge || null,
      patientSex: this.cleanPatientSex(data.patientSex) || 'N/A',
      testDate: data.testDate || data.analysisDate || new Date().toISOString(),
      parameters: this.convertParameters(data.parameters || [])
    };
    
    console.log('Converted LabResult:', labResult);
    return labResult;
  }

  private convertParameters(parameters: any[]): any[] {
    if (!parameters || !Array.isArray(parameters)) return [];
    
    console.log('Converting parameters:', parameters);
    
    return parameters.map(param => {
      console.log('Processing parameter:', param);
      
      const result = {
        name: param.name || param.parameter || 'N/A',
        result: this.extractParameterValue(param),
        unit: param.unit || '',
        status: this.extractParameterStatus(param)
      };
      
      console.log('Converted parameter:', result);
      return result;
    });
  }

  private extractParameterValue(param: any): string {
    // Intentar múltiples estructuras posibles
    if (param.result !== undefined && param.result !== null) {
      return String(param.result);
    }
    
    if (param.value !== undefined && param.value !== null) {
      if (typeof param.value === 'object') {
        if (param.value.numericValue !== undefined) {
          return param.value.numericValue.toString();
        }
        if (param.value.stringValue !== undefined) {
          return param.value.stringValue;
        }
        if (param.value.result !== undefined) {
          return String(param.value.result);
        }
      }
      return String(param.value);
    }
    
    if (param.numericValue !== undefined && param.numericValue !== null) {
      return param.numericValue.toString();
    }
    
    if (param.stringValue !== undefined && param.stringValue !== null) {
      return param.stringValue;
    }
    
    return 'N/A';
  }

  private extractParameterStatus(param: any): string {
    // Buscar en diferentes propiedades posibles
    let status = param.status || param.flag || param.state || '';
    
    if (!status && param.value && typeof param.value === 'object') {
      status = param.value.status || param.value.flag || param.value.state || '';
    }
    
    // Traducir estados comunes
    if (!status) return 'Normal';
    if (status.includes('H') || status.toLowerCase().includes('high') || status.toLowerCase().includes('alto')) return 'Alto';
    if (status.includes('L') || status.toLowerCase().includes('low') || status.toLowerCase().includes('bajo')) return 'Bajo';
    if (status === 'N' || status === '~N' || status.toLowerCase().includes('normal')) return 'Normal';
    
    return status;
  }

  // ========== MÉTODOS MEJORADOS CON GRÁFICOS ==========

  private getParameterDisplayName(name: string): string {
    if (!name) return 'N/A';
    const parts = name.split('^');
    return parts.length > 1 ? parts[1] : parts[0];
  }

  private translateParameterStatus(status: string): string {
    if (!status) return 'Normal';
    if (status.includes('H')) return 'Alto';
    if (status.includes('L')) return 'Bajo';
    if (status === 'N' || status === '~N') return 'Normal';
    return status;
  }

  override formatDateForFilename(dateString: string): string {
    if (!dateString) return 'sin_fecha';
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch (error) {
      return 'sin_fecha';
    }
  }

  private getNormalCount(labResult: any): number {
    if (!labResult.parameters) return 0;
    return labResult.parameters.filter((p: any) => 
      p.status === 'N' || p.status === '~N' || p.status === ''
    ).length;
  }

  private getAbnormalCount(labResult: any): number {
    if (!labResult.parameters) return 0;
    return labResult.parameters.filter((p: any) => 
      p.status && (p.status.includes('H') || p.status.includes('L') || p.status.includes('A'))
    ).length;
  }

  // Nuevos métodos para diseño compacto de una página

  private addCompactHeader(doc: jsPDF, color: string): void {
    // Header más compacto - solo 15px de altura
    doc.setFillColor(color);
    doc.rect(0, 0, 210, 15, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('LABORATORIO CLÍNICO - REPORTE DE RESULTADOS', 105, 10, { align: 'center' });
  }

  private addCompactPatientInfo(doc: jsPDF, labResult: any, color: string): void {
    // Info del paciente en una sola línea compacta
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    const y = 22;
    doc.text(`Paciente: ${labResult.patientName || 'N/A'}`, 5, y);
    doc.text(`ID: ${labResult.sampleNumber}`, 70, y);
    doc.text(`Edad: ${labResult.patientAge || 'N/A'}`, 110, y);
    doc.text(`Sexo: ${labResult.patientSex || 'N/A'}`, 140, y);
    doc.text(`Fecha: ${this.formatDateTime(labResult.testDate).split(' ')[0]}`, 170, y);
  }

  private async addTwoColumnLayout(doc: jsPDF, labResult: any): Promise<void> {
    const startY = 45;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 8;
    
    // División balanceada de columnas
    const leftX = margin;
    const leftWidth = (pageWidth * 0.58) - margin; // 58% para tabla
    const rightX = leftX + leftWidth + 8; // gap de 8
    const rightWidth = pageWidth - rightX - margin; // resto para gráficos
    
    // Tabla con tamaños razonables
    this.addBalancedTable(doc, labResult, leftX, startY, leftWidth);
    
    // Gráficos de tamaño adecuado
    await this.addReasonableSizedCharts(doc, labResult, rightX, startY, rightWidth);
  }

  private addBalancedTable(doc: jsPDF, labResult: any, x: number, y: number, width: number): void {
    if (!labResult.parameters || labResult.parameters.length === 0) return;

    // Título
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('RESULTADOS DE LABORATORIO', x, y);

    // Datos de tabla
    const tableData = labResult.parameters.map((param: any) => [
      this.getParameterDisplayName(param.name),
      param.result,
      param.unit || '',
      this.getStatusText(param.status)
    ]);

    // Tabla con proporciones equilibradas
    autoTable(doc, {
      startY: y + 5,
      head: [['Parámetro', 'Resultado', 'Unidad', 'Estado']],
      body: tableData,
      margin: { left: x, right: 210 - (x + width) },
      tableWidth: width,
      headStyles: {
        fillColor: [70, 130, 180],
        textColor: 255,
        fontSize: 8,
        cellPadding: 3
      },
      bodyStyles: {
        fontSize: 7,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: width * 0.45 }, // Parámetro - 45%
        1: { cellWidth: width * 0.25, halign: 'center' }, // Resultado - 25%
        2: { cellWidth: width * 0.15, halign: 'center' }, // Unidad - 15%
        3: { cellWidth: width * 0.15, halign: 'center' }  // Estado - 15%
      }
    });
  }

  private async addReasonableSizedCharts(doc: jsPDF, labResult: any, x: number, y: number, width: number): Promise<void> {
    const chartWidth = Math.min(width - 5, 50); // Máximo 50, mínimo width-5
    const chartHeight = 35;
    const spacing = 45;
    let currentY = y + 10;

    // WBC Chart
    if (this.chartService.hasWBCData && this.chartService.hasWBCData(labResult.parameters)) {
      try {
        const wbcConfig = this.chartService.createWBCChart(labResult.parameters);
        const wbcImage = await this.chartService.generateChartImage(wbcConfig, 300, 180);
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Serie Blanca (WBC)', x, currentY);
        
        if (wbcImage && wbcImage.includes('data:image/png;base64,')) {
          doc.addImage(wbcImage, 'PNG', x, currentY + 3, chartWidth, chartHeight);
        }
        currentY += spacing;
      } catch (error) {
        console.error('Error WBC:', error);
      }
    }

    // RBC Chart
    if (this.chartService.hasRBCData && this.chartService.hasRBCData(labResult.parameters)) {
      try {
        const rbcConfig = this.chartService.createRBCChart(labResult.parameters);
        const rbcImage = await this.chartService.generateChartImage(rbcConfig, 300, 180);
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Serie Roja (RBC)', x, currentY);
        
        if (rbcImage && rbcImage.includes('data:image/png;base64,')) {
          doc.addImage(rbcImage, 'PNG', x, currentY + 3, chartWidth, chartHeight);
        }
        currentY += spacing;
      } catch (error) {
        console.error('Error RBC:', error);
      }
    }

    // PLT Chart
    if (this.chartService.hasPLTData && this.chartService.hasPLTData(labResult.parameters)) {
      try {
        const pltConfig = this.chartService.createPLTChart(labResult.parameters);
        const pltImage = await this.chartService.generateChartImage(pltConfig, 300, 180);
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Plaquetas (PLT)', x, currentY);
        
        if (pltImage && pltImage.includes('data:image/png;base64,')) {
          doc.addImage(pltImage, 'PNG', x, currentY + 3, chartWidth, chartHeight);
        }
      } catch (error) {
        console.error('Error PLT:', error);
      }
    }
  }

  private getStatusText(status: string): string {
    if (!status) return 'Normal';
    if (status.includes('H')) return 'Alto';
    if (status.includes('L')) return 'Bajo';
    if (status === 'N' || status === '~N') return 'Normal';
    return status;
  }

  // ========== MÉTODOS ORIGINALES (MANTENER COMO RESPALDO) ==========

  private addInstitutionalHeader(doc: jsPDF, startY: number): number {
    // Logo o nombre de la institución
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('LABORATORIO CLÍNICO', this.MARGINS.PAGE_LEFT, startY);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Sistema de Información de Laboratorio - Hematología', this.MARGINS.PAGE_LEFT, startY + 6);
    
    // Línea separadora
    doc.setLineWidth(0.5);
    doc.line(this.MARGINS.PAGE_LEFT, startY + 12, 210 - this.MARGINS.PAGE_RIGHT, startY + 12);
    
    return startY + 20;
  }

  private addPatientAndSampleTables(doc: jsPDF, data: any, startY: number): number {
    try {
      // Tabla Datos del Paciente (izquierda)
      const leftX = this.MARGINS.PAGE_LEFT;
      const rightX = 105;
      const tableWidth = 85;
      const tableHeight = 35;
      
      // Header Datos del Paciente
      doc.setFillColor(240, 240, 240);
      doc.rect(leftX, startY, tableWidth, 8, 'FD');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Datos del Paciente', leftX + tableWidth/2, startY + 5, { align: 'center' });
      
      // Body Datos del Paciente
      doc.setFillColor(255, 255, 255);
      let currentY = startY + 8;
      const patientData = [
        ['Nombre', data.patientName || 'N/A'],
        ['ID Paciente', data.patientId || 'N/A'],
        ['Sexo', this.cleanPatientSex(data.patientSex) || 'N/A'],
        ['Edad', data.patientAge ? `${data.patientAge} años` : 'N/A']
      ];
      
      patientData.forEach((row, index) => {
        doc.rect(leftX, currentY, tableWidth, 9, 'S');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(row[0], leftX + 2, currentY + 6);
        doc.setFont('helvetica', 'normal');
        doc.text(row[1], leftX + 25, currentY + 6);
        currentY += 9;
      });

      // Tabla Datos de la Muestra (derecha)
      currentY = startY;
      
      // Header Datos de la Muestra
      doc.setFillColor(240, 240, 240);
      doc.rect(rightX, currentY, tableWidth, 8, 'FD');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Datos de la Muestra', rightX + tableWidth/2, currentY + 5, { align: 'center' });
      
      // Body Datos de la Muestra
      doc.setFillColor(255, 255, 255);
      currentY += 8;
      const sampleData = [
        ['ID Muestra', data.sampleId || data.sampleNumber || data.id?.toString() || 'N/A'],
        ['Fecha', this.formatDate(data.testDate || data.analysisDate) || 'N/A'],
        ['Equipo', 'Dymind DH36'],
        ['Estado', this.translateStatus(data.status) || 'Procesado']
      ];
      
      sampleData.forEach((row, index) => {
        doc.rect(rightX, currentY, tableWidth, 9, 'S');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(row[0], rightX + 2, currentY + 6);
        doc.setFont('helvetica', 'normal');
        doc.text(row[1], rightX + 25, currentY + 6);
        currentY += 9;
      });

      return startY + tableHeight;
      
    } catch (error) {
      console.error('Error en addPatientAndSampleTables:', error);
      return startY + 40;
    }
  }

  private addHematologyParametersTable(doc: jsPDF, data: any, startY: number): number {
    try {
      const tableX = this.MARGINS.PAGE_LEFT;
      const tableWidth = 170;
      
      // Header Parámetros Hematológicos
      doc.setFillColor(240, 240, 240);
      doc.rect(tableX, startY, tableWidth, 8, 'FD');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('PARÁMETROS HEMATOLÓGICOS', tableX + tableWidth/2, startY + 5, { align: 'center' });
      
      // Obtener parámetros del objeto data
      const parameters = data.parameters || data.testResults || [];
      
      if (!parameters || parameters.length === 0) {
        doc.setFillColor(255, 255, 255);
        doc.rect(tableX, startY + 8, tableWidth, 20, 'S');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text('No hay parámetros disponibles', tableX + tableWidth/2, startY + 18, { align: 'center' });
        return startY + 30;
      }

      // Body con parámetros
      doc.setFillColor(255, 255, 255);
      let currentY = startY + 8;
      
      // Crear encabezados de columnas
      const colWidths = [45, 20, 25, 20, 35, 25];
      const colHeaders = ['Parámetro', 'Código', 'Valor', 'Unidad', 'Rango Referencia', 'Estado'];
      
      // Dibujar encabezados
      doc.setFillColor(220, 220, 220);
      doc.rect(tableX, currentY, tableWidth, 8, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      
      let colX = tableX;
      colHeaders.forEach((header, index) => {
        doc.text(header, colX + 2, currentY + 5);
        colX += colWidths[index];
      });
      currentY += 8;
      
      // Dibujar filas de datos
      parameters.forEach((param: any, index: number) => {
        doc.setFillColor(255, 255, 255);
        doc.rect(tableX, currentY, tableWidth, 8, 'S');
        
        const value = this.getParameterValue(param);
        const status = this.getParameterStatus(param);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        
        colX = tableX;
        const rowData = [
          param.name || param.parameter || 'N/A',
          param.code || param.parameterCode || 'N/A', 
          value,
          param.unit || '',
          param.referenceRange || 'N/A',
          status
        ];
        
        rowData.forEach((cellData, colIndex) => {
          if (colIndex === 5) { // Estado - con color
            const statusColor = this.getStatusColor(status);
            doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
          } else {
            doc.setTextColor(0, 0, 0);
          }
          
          const text = String(cellData).substring(0, 15); // Truncar si es muy largo
          doc.text(text, colX + 2, currentY + 5);
          colX += colWidths[colIndex];
        });
        
        currentY += 8;
      });

      return currentY;
      
    } catch (error) {
      console.error('Error en addHematologyParametersTable:', error);
      return startY + 60;
    }
  }

  private addEquipmentInformationTable(doc: jsPDF, data: any, startY: number): number {
    try {
      const tableX = this.MARGINS.PAGE_LEFT;
      const tableWidth = 170;
      
      // Header Información del Equipo
      doc.setFillColor(240, 240, 240);
      doc.rect(tableX, startY, tableWidth, 8, 'FD');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('INFORMACIÓN DEL EQUIPO', tableX + tableWidth/2, startY + 5, { align: 'center' });
      
      // Body con información técnica
      doc.setFillColor(255, 255, 255);
      let currentY = startY + 8;
      
      const equipmentData = [
        ['Equipo', 'Dymind DH36'],
        ['Operador', data.operator || 'N/A'],
        ['Modo de Análisis', data.analysisMode || 'Automático'],
        ['ID Muestra Interna', data.internalSampleId || 'N/A'],
        ['Fecha de Análisis', this.formatDate(data.testDate || data.analysisDate) || 'N/A'],
        ['Estado del Procesamiento', this.translateStatus(data.status) || 'Completado']
      ];
      
      equipmentData.forEach((row, index) => {
        doc.rect(tableX, currentY, tableWidth, 9, 'S');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(row[0], tableX + 2, currentY + 6);
        doc.setFont('helvetica', 'normal');
        doc.text(row[1], tableX + 60, currentY + 6);
        currentY += 9;
      });

      return currentY;
      
    } catch (error) {
      console.error('Error en addEquipmentInformationTable:', error);
      return startY + 60;
    }
  }

  private addObservationsSection(doc: jsPDF, data: any, startY: number): void {
    // Título Observaciones
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Observaciones', this.MARGINS.PAGE_LEFT, startY);
    
    // Línea para escribir observaciones
    doc.setLineWidth(0.5);
    doc.line(this.MARGINS.PAGE_LEFT, startY + 10, 190, startY + 10);
    
    // Si hay observaciones, mostrarlas
    if (data.observations && data.observations.trim() !== '') {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const splitText = doc.splitTextToSize(data.observations, 170);
      doc.text(splitText, this.MARGINS.PAGE_LEFT, startY + 8);
    }
  }

  private addParametersSection(doc: jsPDF, parameters: any[], startY: number): number {
    this.addSectionTitle(doc, 'PARÁMETROS HEMATOLÓGICOS', this.MARGINS.PAGE_LEFT, startY);

    const tableData = parameters.map(param => {
      const value = this.getParameterDisplayValue(param);
      const status = this.getParameterStatus(param);
      const statusColor = this.getStatusColor(status);
      
      return [
        param.name,
        param.code,
        value,
        param.unit || '',
        param.referenceRange || 'N/A',
        { content: status, styles: { textColor: statusColor } }
      ];
    });

    autoTable(doc, {
      startY: startY + 5,
      head: [['Parámetro', 'Código', 'Valor', 'Unidad', 'Rango Referencia', 'Estado']],
      body: tableData,
      styles: {
        fontSize: this.FONTS.SMALL_TEXT,
        cellPadding: 2,
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: this.hexToRgb(this.COLORS.PRIMARY),
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: this.FONTS.NORMAL_TEXT
      },
      alternateRowStyles: {
        fillColor: this.hexToRgb(this.COLORS.LIGHT_GRAY)
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 20 },
        2: { cellWidth: 25, halign: 'right' },
        3: { cellWidth: 20 },
        4: { cellWidth: 35 },
        5: { cellWidth: 25, halign: 'center' }
      },
      margin: { left: this.MARGINS.PAGE_LEFT, right: this.MARGINS.PAGE_RIGHT }
    });

    return (doc as any).lastAutoTable.finalY + 10;
  }

  private async addChartsSection(doc: jsPDF, data: any): Promise<void> {
    this.addSectionTitle(doc, 'GRÁFICOS HEMATOLÓGICOS', this.MARGINS.PAGE_LEFT, 25);

    const chartTypes = ['WBC', 'RBC', 'PLT'];
    let yPosition = 35;

    for (const chartType of chartTypes) {
      try {
        // Temporalmente deshabilitado hasta verificar el método correcto
        // const chartDataUrl = await this.chartService.generateChartDataUrl(data, chartType);
        const chartDataUrl = null;
        
        if (chartDataUrl) {
          // Título del gráfico
          doc.setFontSize(this.FONTS.NORMAL_TEXT);
          doc.setFont('helvetica', 'bold');
          doc.text(`Gráfico ${chartType}`, this.MARGINS.PAGE_LEFT, yPosition);
          
          // Insertar imagen del gráfico
          doc.addImage(chartDataUrl, 'PNG', this.MARGINS.PAGE_LEFT, yPosition + 2, 180, 60);
          yPosition += 70;
          
          // Nueva página si queda poco espacio
          if (yPosition > 220) {
            doc.addPage();
            yPosition = 25;
          }
        }
      } catch (error) {
        console.warn(`Error al generar gráfico ${chartType}:`, error);
        
        // Mostrar mensaje de error en lugar del gráfico
        doc.setFontSize(this.FONTS.NORMAL_TEXT);
        const [r, g, b] = this.hexToRgb(this.COLORS.DANGER);
        doc.setTextColor(r, g, b);
        doc.text(`Gráfico ${chartType}: No disponible`, this.MARGINS.PAGE_LEFT, yPosition);
        yPosition += 10;
      }
    }
  }

  private addFooterToAllPages(doc: jsPDF): void {
    const totalPages = doc.getNumberOfPages();
    
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      const pageHeight = doc.internal.pageSize.height;
      const yPos = pageHeight - 20;
      
      // Línea separadora
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.line(this.MARGINS.PAGE_LEFT, yPos - 5, 195, yPos - 5);
      
      // Información del pie
      doc.setFontSize(this.FONTS.TINY_TEXT);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      
      doc.text('Laboratorio Clínico Nexos - Sistema Dymind DH36', this.MARGINS.PAGE_LEFT, yPos);
      doc.text(`Página ${i} de ${totalPages}`, 195, yPos, { align: 'right' });
      doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 105, yPos + 4, { align: 'center' });
    }
  }

  // ========== MÉTODOS AUXILIARES ESPECÍFICOS ==========

  private getParameterDisplayValue(param: any): string {
    if (!param.value) return 'N/A';
    
    if (typeof param.value === 'object' && 'numericValue' in param.value) {
      const paramValue = param.value as any;
      return paramValue.numericValue?.toFixed(2) || paramValue.stringValue || 'N/A';
    }
    
    return typeof param.value === 'number' ? param.value.toFixed(2) : String(param.value);
  }

  // ========== MÉTODOS DE UTILIDAD ADICIONALES ==========

  private getParameterValue(param: any): string {
    if (!param.value) return 'N/A';
    
    if (typeof param.value === 'object' && 'numericValue' in param.value) {
      const paramValue = param.value as any;
      return paramValue.numericValue?.toFixed(2) || paramValue.stringValue || 'N/A';
    }
    
    return typeof param.value === 'number' ? param.value.toFixed(2) : String(param.value);
  }

  private getParameterStatus(param: any): string {
    if (!param.value || !param.referenceRange) return 'N/A';
    
    const numericValue = this.getNumericValue(param.value);
    if (numericValue === null) return 'N/A';
    
    const range = this.parseReferenceRange(param.referenceRange);
    if (!range) return 'N/A';
    
    if (numericValue < range.min) return 'BAJO';
    if (numericValue > range.max) return 'ALTO';
    return 'NORMAL';
  }

  private getStatusColor(status: string): [number, number, number] {
    switch (status) {
      case 'ALTO': return this.hexToRgb(this.DH36_COLORS.HIGH_VALUE);
      case 'BAJO': return this.hexToRgb(this.DH36_COLORS.LOW_VALUE);
      case 'NORMAL': return this.hexToRgb(this.DH36_COLORS.NORMAL_VALUE);
      default: return [0, 0, 0];
    }
  }

  private getNumericValue(value: any): number | null {
    if (typeof value === 'number') return value;
    if (typeof value === 'object' && 'numericValue' in value) {
      return value.numericValue;
    }
    const parsed = parseFloat(String(value));
    return isNaN(parsed) ? null : parsed;
  }

  private parseReferenceRange(range: string): { min: number; max: number } | null {
    const match = range.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/);
    if (!match) return null;
    
    return {
      min: parseFloat(match[1]),
      max: parseFloat(match[2])
    };
  }

  private cleanPatientSex(sex: string): string {
    if (!sex) return 'N/A';
    
    // Limpiar valores como "MujerPV1" -> "Mujer"
    if (sex.toLowerCase().includes('mujer')) return 'Femenino';
    if (sex.toLowerCase().includes('hombre') || sex.toLowerCase().includes('masculino')) return 'Masculino';
    if (sex.toLowerCase().includes('fem')) return 'Femenino';
    if (sex.toLowerCase().includes('mas')) return 'Masculino';
    if (sex.toLowerCase() === 'f' || sex.toLowerCase() === 'female') return 'Femenino';
    if (sex.toLowerCase() === 'm' || sex.toLowerCase() === 'male') return 'Masculino';
    
    return sex;
  }

  private formatDate(dateString: string): string {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  }

  override formatDateTime(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('es-ES', {
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


}
