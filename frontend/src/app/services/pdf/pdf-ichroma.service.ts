import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { PdfBaseService } from './pdf-base.service';

@Injectable({
  providedIn: 'root'
})
export class PdfIchromaService extends PdfBaseService {

  constructor() {
    super();
  }

  async generatePdf(data: any): Promise<void> {
    try {
      console.log('PDF iChroma Service - Datos recibidos:', data);
      console.log('Estructura de datos completa:', JSON.stringify(data, null, 2));
      
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
      const title = 'ANÁLISIS QUÍMICO CLÍNICO - iChroma II';
      const titleWidth = doc.getTextWidth(title);
      const centerX = (210 - titleWidth) / 2;
      doc.text(title, centerX, currentY);
      currentY += 15;
      
      // Sección de Resultados de Marcadores
      currentY = this.addMarkersResultsTable(doc, data, currentY);
      
      // Información Técnica del Análisis
      currentY += 10;
      currentY = this.addTechnicalInformationTable(doc, data, currentY);
      
      // Interpretaciones Clínicas
      currentY += 10;
      currentY = this.addClinicalInterpretationsSection(doc, data, currentY);
      
      // Observaciones
      currentY += 10;
      this.addObservationsSection(doc, data, currentY);
      
      // Guardar archivo
      const filename = `iChroma_${data.patientName?.replace(/\s+/g, '_') || 'Sin_nombre'}_${Date.now()}.pdf`;
      console.log('Guardando PDF iChroma con formato estándar:', filename);
      doc.save(filename);
      
    } catch (error) {
      console.error('Error al generar PDF de iChroma:', error);
      throw new Error('Error al generar el reporte PDF de iChroma II');
    }
  }

  private addInstitutionalHeader(doc: jsPDF, startY: number): number {
    // Logo o nombre de la institución
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('LABORATORIO CLÍNICO', this.MARGINS.PAGE_LEFT, startY);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Sistema de Información de Laboratorio - iChroma II', this.MARGINS.PAGE_LEFT, startY + 6);
    
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
        ['Sexo', data.patientSex || 'N/A'],
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
        ['ID Muestra', data.id?.toString() || 'N/A'],
        ['Fecha', this.formatDate(data.testDate || data.createdAt) || 'N/A'],
        ['Tipo de Test', data.testType || 'N/A'],
        ['Código Muestra', data.sampleBarcode || 'N/A']
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

  private addMarkersResultsTable(doc: jsPDF, data: any, startY: number): number {
    try {
      const tableX = this.MARGINS.PAGE_LEFT;
      const tableWidth = 170;
      
      // Header Resultados de Marcadores
      doc.setFillColor(240, 240, 240);
      doc.rect(tableX, startY, tableWidth, 8, 'FD');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('RESULTADOS DE MARCADORES', tableX + tableWidth/2, startY + 5, { align: 'center' });
      
      // Body con los datos del marcador
      doc.setFillColor(255, 255, 255);
      let currentY = startY + 8;
      
      // Crear tabla con columnas para los datos del marcador
      const markerData = [
        ['Marcador', data.testName || 'N/A'],
        ['Resultado', this.formatTestResult(data.result, data.unit) || 'N/A'],
        ['Unidad', data.unit || 'N/A'],
        ['Rango de Referencia', this.formatReferenceRange(data.referenceMin, data.referenceMax) || 'N/A'],
        ['Estado', this.getResultStatus(data.result, data.referenceMin, data.referenceMax) || 'N/A']
      ];
      
      markerData.forEach((row, index) => {
        doc.rect(tableX, currentY, tableWidth, 9, 'S');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(row[0], tableX + 2, currentY + 6);
        doc.setFont('helvetica', 'normal');
        doc.text(row[1], tableX + 50, currentY + 6);
        currentY += 9;
      });

      return currentY;
      
    } catch (error) {
      console.error('Error en addMarkersResultsTable:', error);
      return startY + 50;
    }
  }

  private addTechnicalInformationTable(doc: jsPDF, data: any, startY: number): number {
    try {
      const tableX = this.MARGINS.PAGE_LEFT;
      const tableWidth = 170;
      
      // Header Información Técnica
      doc.setFillColor(240, 240, 240);
      doc.rect(tableX, startY, tableWidth, 8, 'FD');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('INFORMACIÓN TÉCNICA DEL ANÁLISIS', tableX + tableWidth/2, startY + 5, { align: 'center' });
      
      // Body con información técnica
      doc.setFillColor(255, 255, 255);
      let currentY = startY + 8;
      
      const technicalData = [
        ['Equipo', data.instrumentId || 'iChroma II'],
        ['Dispositivo ID', data.deviceId || 'N/A'],
        ['Serial Cartucho', data.cartridgeSerial || 'N/A'],
        ['Lote Cartucho', data.cartridgeLot || 'N/A'],
        ['Humedad', data.humidity ? `${data.humidity}%` : 'N/A'],
        ['Estado Procesamiento', this.translateProcessingStatus(data.processingStatus) || 'N/A']
      ];
      
      technicalData.forEach((row, index) => {
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
      console.error('Error en addTechnicalInformationTable:', error);
      return startY + 60;
    }
  }

  private addClinicalInterpretationsSection(doc: jsPDF, data: any, startY: number): number {
    try {
      // Título
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('INTERPRETACIONES CLÍNICAS', this.MARGINS.PAGE_LEFT, startY);
      
      let currentY = startY + 8;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      // Generar interpretación basada en el resultado
      const interpretation = this.generateClinicalInterpretation(data);
      
      if (interpretation && interpretation.trim() !== '') {
        const splitText = doc.splitTextToSize(interpretation, 170);
        doc.text(splitText, this.MARGINS.PAGE_LEFT, currentY);
        currentY += splitText.length * 4;
      } else {
        doc.text('No hay interpretaciones específicas disponibles para este resultado.', this.MARGINS.PAGE_LEFT, currentY);
        currentY += 8;
      }
      
      // Agregar notas técnicas si existen
      if (data.technicalNotes && data.technicalNotes.trim() !== '') {
        currentY += 5;
        doc.setFont('helvetica', 'bold');
        doc.text('Notas Técnicas:', this.MARGINS.PAGE_LEFT, currentY);
        currentY += 5;
        
        doc.setFont('helvetica', 'normal');
        const notesSplit = doc.splitTextToSize(data.technicalNotes, 170);
        doc.text(notesSplit, this.MARGINS.PAGE_LEFT, currentY);
        currentY += notesSplit.length * 4;
      }

      return currentY;
      
    } catch (error) {
      console.error('Error en addClinicalInterpretationsSection:', error);
      return startY + 20;
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
      doc.text(data.observations, this.MARGINS.PAGE_LEFT, startY + 8);
    }
  }

  // ========== MÉTODOS DE UTILIDAD ==========

  private formatReferenceRange(min: number | null, max: number | null): string {
    if (min === null && max === null) return 'No establecido';
    if (min === null) return `≤ ${max}`;
    if (max === null) return `≥ ${min}`;
    return `${min} - ${max}`;
  }

  private getResultStatus(value: string, min: number | null, max: number | null): string {
    if (!value || (min === null && max === null)) return 'N/A';
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'N/A';
    
    if (min !== null && numValue < min) return 'BAJO';
    if (max !== null && numValue > max) return 'ALTO';
    return 'NORMAL';
  }

  private formatTestResult(value: string, unit: string): string {
    if (!value) return 'N/A';
    
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      return `${numValue.toFixed(2)} ${unit || ''}`.trim();
    }
    
    return value;
  }

  private translateProcessingStatus(status: string): string {
    if (!status) return 'N/A';
    
    switch (status.toLowerCase()) {
      case 'processed': return 'Procesado';
      case 'completed': return 'Completado';
      case 'pending': return 'Pendiente';
      case 'failed': return 'Fallido';
      case 'error': return 'Error';
      default: return status;
    }
  }

  private generateClinicalInterpretation(data: any): string {
    if (!data.result || !data.testName) {
      return 'No se puede generar interpretación sin resultado o nombre de test.';
    }

    const numResult = parseFloat(data.result);
    if (isNaN(numResult)) {
      return `Resultado cualitativo: ${data.result}. Consulte con su médico para interpretación específica.`;
    }

    const testName = data.testName.toLowerCase();
    const status = this.getResultStatus(data.result, data.referenceMin, data.referenceMax);
    
    let interpretation = `El resultado para ${data.testName} es ${data.result} ${data.unit || ''}. `;
    
    switch (status) {
      case 'NORMAL':
        interpretation += 'Este valor se encuentra dentro del rango de referencia normal.';
        break;
      case 'ALTO':
        interpretation += 'Este valor se encuentra elevado respecto al rango de referencia.';
        break;
      case 'BAJO':
        interpretation += 'Este valor se encuentra disminuido respecto al rango de referencia.';
        break;
      default:
        interpretation += 'Consulte los valores de referencia para interpretación.';
    }

    // Interpretaciones específicas por tipo de test
    if (testName.includes('troponin') || testName.includes('troponina')) {
      if (status === 'ALTO') {
        interpretation += ' Troponina elevada puede indicar daño miocárdico.';
      }
    } else if (testName.includes('crp') || testName.includes('proteína c reactiva')) {
      if (status === 'ALTO') {
        interpretation += ' Proteína C Reactiva elevada indica proceso inflamatorio.';
      }
    } else if (testName.includes('psa')) {
      if (status === 'ALTO') {
        interpretation += ' PSA elevado requiere evaluación urológica.';
      }
    } else if (testName.includes('hcg') || testName.includes('beta hcg')) {
      if (numResult > 5) {
        interpretation += ' Resultado compatible con embarazo.';
      }
    }

    interpretation += ' Se recomienda correlacionar con el cuadro clínico y otros estudios complementarios.';
    
    return interpretation;
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
}