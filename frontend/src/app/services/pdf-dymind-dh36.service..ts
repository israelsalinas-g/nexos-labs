import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LabResult, Parameter } from '../models/lab-result.interface';
import { ChartService } from './chart.service';

@Injectable({
  providedIn: 'root'
})
export class PdfDymindDh36Service {

  constructor(private chartService: ChartService) { }

  async generateLabResultPdf(labResult: LabResult): Promise<void> {
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

  // Métodos auxiliares
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

  private translateStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'processed': 'Procesado',
      'pending': 'Pendiente',
      'error': 'Error',
      'validated': 'Validado'
    };
    return statusMap[status] || status;
  }

  private formatDateTime(dateString: string): string {
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

  private formatDateForFilename(dateString: string): string {
    if (!dateString) return 'sin_fecha';
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch (error) {
      return 'sin_fecha';
    }
  }

  private getNormalCount(labResult: LabResult): number {
    if (!labResult.parameters) return 0;
    return labResult.parameters.filter(p => 
      p.status === 'N' || p.status === '~N' || p.status === ''
    ).length;
  }

  private getAbnormalCount(labResult: LabResult): number {
    if (!labResult.parameters) return 0;
    return labResult.parameters.filter(p => 
      p.status && (p.status.includes('H') || p.status.includes('L') || p.status.includes('A'))
    ).length;
  }

  private async addChartsToCurrentPage(doc: jsPDF, labResult: LabResult): Promise<number> {
    if (!labResult.parameters || labResult.parameters.length === 0) {
      // Retornar posición después de la tabla si no hay parámetros
      return (doc as any).lastAutoTable?.finalY || 200;
    }

    // Verificar si hay datos para algún gráfico
    const hasWBC = this.chartService.hasWBCData(labResult.parameters);
    const hasRBC = this.chartService.hasRBCData(labResult.parameters);
    const hasPLT = this.chartService.hasPLTData(labResult.parameters);

    if (!hasWBC && !hasRBC && !hasPLT) {
      // Retornar posición después de la tabla si no hay gráficos
      return (doc as any).lastAutoTable?.finalY || 200;
    }

    // Verificar espacio disponible en la página actual
    const currentY = (doc as any).lastAutoTable?.finalY || 200;
    const pageHeight = doc.internal.pageSize.height;
    const footerSpace = 45; // Aumentar espacio reservado para el footer
    const spaceNeeded = 80; // Espacio necesario para gráficos + títulos + margen
    
    // Si no hay suficiente espacio, crear nueva página
    if (currentY + spaceNeeded > pageHeight - footerSpace) {
      doc.addPage();
    }

    // Posición inicial (nueva página o continuación)
    let yPosition = doc.getNumberOfPages() > 1 && currentY + spaceNeeded > pageHeight - footerSpace ? 25 : currentY + 20;
    
    // Verificar que no invadimos el footer incluso en nueva página
    const maxY = pageHeight - footerSpace;
    if (yPosition > maxY - 60) {
      yPosition = 25; // Resetear al inicio de página
    }
    
    // Título de la sección de gráficos
    doc.setTextColor(44, 62, 80);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ANÁLISIS GRÁFICO', 105, yPosition, { align: 'center' });
    
    yPosition += 12;
    
    // Dimensiones más pequeñas para gráficos en fila
    const chartWidth = 45; // Reducir un poco más
    const chartHeight = 30; // Reducir altura
    const chartSpacing = 50; // Reducir espaciado
    const startX = 30; // Centrar mejor

    try {
      // Generar todos los gráficos
      const charts = [];
      
      if (hasWBC) {
        try {
          const wbcConfig = this.chartService.createWBCChart(labResult.parameters);
          const wbcImage = await this.chartService.generateChartImage(wbcConfig, 300, 180);
          charts.push({ image: wbcImage, title: 'WBC' });
        } catch (error) {
          console.error('Error generando gráfico WBC:', error);
          charts.push({ image: null, title: 'WBC' });
        }
      }

      if (hasRBC) {
        try {
          const rbcConfig = this.chartService.createRBCChart(labResult.parameters);
          const rbcImage = await this.chartService.generateChartImage(rbcConfig, 300, 180);
          charts.push({ image: rbcImage, title: 'RBC' });
        } catch (error) {
          console.error('Error generando gráfico RBC:', error);
          charts.push({ image: null, title: 'RBC' });
        }
      }

      if (hasPLT) {
        try {
          const pltConfig = this.chartService.createPLTChart(labResult.parameters);
          const pltImage = await this.chartService.generateChartImage(pltConfig, 300, 180);
          charts.push({ image: pltImage, title: 'PLT' });
        } catch (error) {
          console.error('Error generando gráfico PLT:', error);
          charts.push({ image: null, title: 'PLT' });
        }
      }

      // Colocar gráficos en una fila
      charts.forEach((chart, index) => {
        const xPosition = startX + (index * chartSpacing);
        
        // Título del gráfico
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(44, 62, 80);
        doc.text(chart.title, xPosition + (chartWidth / 2), yPosition - 2, { align: 'center' });
        
        // Gráfico o imagen de respaldo
        if (chart.image && chart.image.includes('data:image/png;base64,') && chart.image.length > 500) {
          doc.addImage(chart.image, 'PNG', xPosition, yPosition, chartWidth, chartHeight);
          console.log(`Gráfico ${chart.title} agregado en posición ${index + 1}`);
        } else {
          // Crear un rectángulo con texto de respaldo
          doc.setDrawColor(200, 200, 200);
          doc.setFillColor(248, 249, 250);
          doc.rect(xPosition, yPosition, chartWidth, chartHeight, 'FD');
          
          doc.setFontSize(5);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 100, 100);
          doc.text('Ver tabla', xPosition + (chartWidth / 2), yPosition + (chartHeight / 2), { align: 'center' });
          
          console.warn(`Gráfico ${chart.title} no disponible, mostrando respaldo`);
        }
      });

      // Agregar nota explicativa compacta
      doc.setFontSize(6);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text('WBC: Serie Blanca | RBC: Serie Roja | PLT: Plaquetas', 
               105, yPosition + chartHeight + 8, { align: 'center' });

      // Retornar la posición Y final
      return yPosition + chartHeight + 15;

    } catch (error) {
      console.error('Error adding charts to PDF:', error);
      
      // Agregar mensaje de error compacto
      doc.setTextColor(220, 53, 69);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Error al generar gráficos. Consulte la tabla de parámetros.', 
               105, yPosition + 15, { align: 'center' });
      
      // Retornar posición Y de error
      return yPosition + 25;
    }
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

  private addCompactPatientInfo(doc: jsPDF, labResult: LabResult, color: string): void {
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

  private async addTwoColumnLayout(doc: jsPDF, labResult: LabResult): Promise<void> {
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

  private addBalancedTable(doc: jsPDF, labResult: LabResult, x: number, y: number, width: number): void {
    if (!labResult.parameters || labResult.parameters.length === 0) return;

    // Título
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('RESULTADOS DE LABORATORIO', x, y);

    // Datos de tabla
    const tableData = labResult.parameters.map(param => [
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

  private async addReasonableSizedCharts(doc: jsPDF, labResult: LabResult, x: number, y: number, width: number): Promise<void> {
    const chartWidth = Math.min(width - 5, 50); // Máximo 50, mínimo width-5
    const chartHeight = 35;
    const spacing = 45;
    let currentY = y + 10;

    // WBC Chart
    if (this.chartService.hasWBCData(labResult.parameters)) {
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
    if (this.chartService.hasRBCData(labResult.parameters)) {
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
    if (this.chartService.hasPLTData(labResult.parameters)) {
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
}