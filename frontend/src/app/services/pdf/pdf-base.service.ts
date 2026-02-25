import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export abstract class PdfBaseService {

  // ========== CONFIGURACIONES COMUNES ==========
  
  protected readonly COLORS = {
    PRIMARY: '#2c3e50',
    SECONDARY: '#3498db',
    SUCCESS: '#2ecc71',
    WARNING: '#f39c12',
    DANGER: '#e74c3c',
    LIGHT_GRAY: '#f8f9fa',
    GRAY: '#6c757d',
    WHITE: '#ffffff'
  };

  protected readonly FONTS = {
    HEADER_TITLE: 16,
    HEADER_SUBTITLE: 10,
    SECTION_TITLE: 9,
    NORMAL_TEXT: 8,
    SMALL_TEXT: 7,
    TINY_TEXT: 6
  };

  protected readonly MARGINS = {
    PAGE_TOP: 15,
    PAGE_BOTTOM: 15,
    PAGE_LEFT: 15,
    PAGE_RIGHT: 15,
    SECTION_SPACING: 5
  };

  // ========== MÉTODOS AUXILIARES COMUNES ==========

  protected formatDateTime(date: string | Date | undefined): string {
    if (!date) return 'N/A';
    
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'N/A';
    
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  protected formatDateForFilename(date: string | Date | undefined): string {
    if (!date) return 'sin_fecha';
    
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return 'sin_fecha';
    
    return d.toISOString().split('T')[0];
  }

  protected addStandardHeader(doc: jsPDF, title: string, subtitle?: string): void {
    // Header con fondo
    const [r, g, b] = this.hexToRgb(this.COLORS.PRIMARY);
    doc.setFillColor(r, g, b);
    doc.rect(0, 0, 210, 20, 'F');
    
    // Título principal
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(this.FONTS.HEADER_TITLE);
    doc.setFont('helvetica', 'bold');
    doc.text('LABORATORIO CLÍNICO NEXOS', 105, 8, { align: 'center' });
    
    // Subtítulo si se proporciona
    if (subtitle) {
      doc.setFontSize(this.FONTS.HEADER_SUBTITLE);
      doc.setFont('helvetica', 'normal');
      doc.text(subtitle, 105, 15, { align: 'center' });
    }
  }

  protected addStandardFooter(doc: jsPDF, additionalInfo?: string): void {
    const pageHeight = doc.internal.pageSize.height;
    const yPos = pageHeight - 25;
    
    doc.setFontSize(this.FONTS.TINY_TEXT);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    
    doc.text('Este reporte fue generado automáticamente por el sistema de laboratorio', 105, yPos, { align: 'center' });
    doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 105, yPos + 4, { align: 'center' });
    
    if (additionalInfo) {
      doc.text(additionalInfo, 105, yPos + 8, { align: 'center' });
    }
  }

  protected addPatientInfoSection(doc: jsPDF, patientName: string, patientAge?: number, patientSex?: string, sampleId?: string, testDate?: string | Date): number {
    console.log('addPatientInfoSection - Datos:', { patientName, patientAge, patientSex, sampleId, testDate });
    const startY = 26;
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(this.FONTS.SECTION_TITLE);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN DEL PACIENTE', this.MARGINS.PAGE_LEFT, startY);
    
    const infoY = startY + 5;
    doc.setFontSize(this.FONTS.NORMAL_TEXT);
    doc.setFont('helvetica', 'normal');
    
    doc.text(`Paciente: ${patientName || 'N/A'}`, this.MARGINS.PAGE_LEFT, infoY);
    doc.text(`Edad: ${patientAge ? patientAge + ' años' : 'N/A'}`, this.MARGINS.PAGE_LEFT, infoY + 4);
    doc.text(`Sexo: ${patientSex || 'N/A'}`, this.MARGINS.PAGE_LEFT, infoY + 8);
    
    if (sampleId) {
      doc.text(`ID Muestra: ${sampleId}`, 115, infoY);
    }
    if (testDate) {
      doc.text(`Fecha: ${this.formatDateTime(testDate)}`, 115, infoY + 4);
    }
    
    return infoY + 15; // Retorna la siguiente posición Y disponible
  }

  protected addSectionTitle(doc: jsPDF, title: string, x: number, y: number, color?: string): void {
    doc.setFontSize(this.FONTS.SECTION_TITLE);
    doc.setFont('helvetica', 'bold');
    const [r, g, b] = color ? this.hexToRgb(color) : [0, 0, 0];
    doc.setTextColor(r, g, b);
    doc.text(title, x, y);
  }

  protected addInterpretationSection(doc: jsPDF, interpretation: string, startY: number): number {
    this.addSectionTitle(doc, 'INTERPRETACIÓN CLÍNICA', this.MARGINS.PAGE_LEFT, startY);
    
    const interpretationY = startY + 5;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.rect(this.MARGINS.PAGE_LEFT, interpretationY - 1, 180, 20);
    
    doc.setFontSize(this.FONTS.NORMAL_TEXT);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    const interpretationLines = doc.splitTextToSize(interpretation, 174);
    doc.text(interpretationLines, this.MARGINS.PAGE_LEFT + 2, interpretationY + 4);
    
    return interpretationY + 25; // Siguiente posición Y
  }

  // ========== UTILIDADES DE CONVERSIÓN ==========

  protected hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  }

  protected translateStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'processed': 'Procesado',
      'pending': 'Pendiente',
      'error': 'Error',
      'validated': 'Validado',
      'completed': 'Completado',
      'reviewed': 'Revisado'
    };
    return statusMap[status] || status;
  }

  // ========== MÉTODO ABSTRACTO QUE CADA SERVICIO DEBE IMPLEMENTAR ==========
  
  abstract generatePdf(data: any): Promise<void>;
}