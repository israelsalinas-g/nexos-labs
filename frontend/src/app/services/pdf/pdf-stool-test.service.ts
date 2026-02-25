import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Injectable } from '@angular/core';
import { StoolTest } from '../../models/stool-test.interface';

async function loadImageAsBase64(path: string): Promise<string> {
  const response = await fetch(path);
  const blob = await response.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

@Injectable({
  providedIn: 'root'
})
export class PdfStoolTestService {

  constructor() {}

  async generateStoolReport(exam: StoolTest): Promise<void> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yPos = 15;

    // Colores
    const primaryColor: [number, number, number] = [41, 128, 185];
    const secondaryColor: [number, number, number] = [240, 248, 255];
    const textColor: [number, number, number] = [51, 51, 51];

    // ========== ENCABEZADO CON LOGOS ==========
    try {
      const logoLab = await loadImageAsBase64('assets/images/lab/logo_CMO_LABS.png');
      const infoContact = await loadImageAsBase64('assets/images/lab/info_contacto.png');
      
      doc.addImage(logoLab, 'PNG', margin, yPos, 50, 20);
      doc.addImage(infoContact, 'PNG', pageWidth - margin - 80, yPos, 80, 20);
    } catch (error) {
      console.error('Error cargando imágenes del encabezado:', error);
    }

    yPos += 25;

    // Línea separadora
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;

    // ========== DATOS DEL PACIENTE ==========
    doc.setTextColor(...textColor);
    doc.setFontSize(9);
    
    const patientInfoY = yPos;
    
    // Primera línea
    doc.setFont('helvetica', 'bold');
    doc.text('PACIENTE:', margin, patientInfoY);
    doc.setFont('helvetica', 'normal');
    doc.text(exam.patient.name.toUpperCase(), margin + 25, patientInfoY);
    
    doc.setFont('helvetica', 'bold');
    doc.text('EDAD:', margin + 120, patientInfoY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${exam.patient.age} AÑOS`, margin + 135, patientInfoY);
    
    yPos += 5;
    
    // Segunda línea
    doc.setFont('helvetica', 'bold');
    doc.text('IDENTIDAD:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(exam.patient?.dni || 'N/A', margin + 25, yPos);
    
    doc.setFont('helvetica', 'bold');
    doc.text('SEXO:', margin + 120, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(exam.patient.sex === 'MALE' ? 'Masculino' : 'Femenino', margin + 135, yPos);
    
    yPos += 5;
    
    // Tercera línea
    doc.setFont('helvetica', 'bold');
    doc.text('FECHA NACIMIENTO:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(this.formatDate(exam.patient?.birthDate), margin + 40, yPos);
    
    yPos += 5;
    
    // Cuarta línea
    doc.setFont('helvetica', 'bold');
    doc.text('FECHA EMISIÓN:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(this.formatDate(exam.testDate), margin + 40, yPos);
    
    yPos += 10;

    // ========== TÍTULO DEL EXAMEN ==========
    doc.setFillColor(...primaryColor);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('EXAMEN GENERAL DE HECES', pageWidth / 2, yPos + 5.5, { align: 'center' });
    yPos += 12;

    // ========== EXAMEN MACROSCÓPICO ==========
    this.addSectionHeader(doc, 'EXAMEN MACROSCÓPICO', margin, yPos, pageWidth - 2 * margin, primaryColor);
    yPos += 7;
    
    yPos = this.addDataRow(doc, 'COLOR:', exam.color, margin, yPos, pageWidth - 2 * margin, true);
    yPos = this.addDataRow(doc, 'CONSISTENCIA:', exam.consistency, margin, yPos, pageWidth - 2 * margin, false);
    yPos = this.addDataRow(doc, 'FORMA:', exam.shape, margin, yPos, pageWidth - 2 * margin, true);
    yPos = this.addDataRow(doc, 'MOCO:', exam.mucus, margin, yPos, pageWidth - 2 * margin, false);
    
    yPos += 5;

    // ========== EXAMEN MICROSCÓPICO ==========
    this.addSectionHeader(doc, 'EXAMEN MICROSCÓPICO', margin, yPos, pageWidth - 2 * margin, primaryColor);
    yPos += 7;
    
    yPos = this.addDataRow(doc, 'LEUCOCITOS:', exam.leukocytes, margin, yPos, pageWidth - 2 * margin, true);
    yPos = this.addDataRow(doc, 'ERITROCITOS:', exam.erythrocytes, margin, yPos, pageWidth - 2 * margin, false);
    
    yPos += 5;

    // ========== PARÁSITOS ==========
    this.addSectionHeader(doc, 'PARÁSITOS OBSERVADOS', margin, yPos, pageWidth - 2 * margin, primaryColor);
    yPos += 7;

    if (exam.parasites && exam.parasites.length > 0) {
      let isShaded = true;
      for (const parasite of exam.parasites) {
        yPos = this.addDataRow(doc, parasite.type.toUpperCase() + ':', parasite.quantity, margin, yPos, pageWidth - 2 * margin, isShaded);
        isShaded = !isShaded;
      }
    } else {
      yPos = this.addDataRow(doc, 'RESULTADO:', 'No se observaron parásitos', margin, yPos, pageWidth - 2 * margin, true);
    }
    
    yPos += 5;

    // ========== PROTOZOOS ==========
    this.addSectionHeader(doc, 'PROTOZOOS OBSERVADOS', margin, yPos, pageWidth - 2 * margin, primaryColor);
    yPos += 7;

    if (exam.protozoos && exam.protozoos.length > 0) {
      let isShaded = true;
      for (const protozoo of exam.protozoos) {
        yPos = this.addDataRow(doc, protozoo.type.toUpperCase() + ':', protozoo.quantity, margin, yPos, pageWidth - 2 * margin, isShaded);
        isShaded = !isShaded;
      }
    } else {
      yPos = this.addDataRow(doc, 'RESULTADO:', 'No se observaron protozoos', margin, yPos, pageWidth - 2 * margin, true);
    }
    
    yPos += 5;

    // ========== OBSERVACIONES ==========
    if (exam.observations && exam.observations.toLowerCase() !== 'ninguna') {
      this.addSectionHeader(doc, 'OBSERVACIONES', margin, yPos, pageWidth - 2 * margin, primaryColor);
      yPos += 7;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textColor);
      
      // Dividir texto largo en líneas si es necesario
      const observationLines = doc.splitTextToSize(exam.observations, pageWidth - 2 * margin - 4);
      doc.text(observationLines, margin + 2, yPos);
      yPos += observationLines.length * 5 + 5;
    }

    // ========== FIRMA Y SELLO AL FINAL ==========
    // Asegurar que haya espacio suficiente para firma
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    } else {
      yPos = Math.max(yPos, 240);
    }

    try {
      const microbiologo = await loadImageAsBase64('assets/images/lab/microbiologo.png');
      const logoOgyne = await loadImageAsBase64('assets/images/lab/ogyne_sello.png');
      
      // Centrar las imágenes
      doc.addImage(microbiologo, 'PNG', pageWidth / 2 - 50, yPos, 40, 30);
      doc.addImage(logoOgyne, 'PNG', pageWidth / 2 + 15, yPos, 30, 30);
      
      yPos += 35;
    } catch (error) {
      console.error('Error cargando imágenes de firma:', error);
      yPos += 10;
    }

    // Línea de firma
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textColor);
    doc.text('_______________________________', pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;
    doc.text('DR. ERICK VARELA', pageWidth / 2, yPos, { align: 'center' });
    yPos += 4;
    doc.setFont('helvetica', 'normal');
    doc.text('MICROBIÓLOGO', pageWidth / 2, yPos, { align: 'center' });

    // Guardar PDF
    const fileName = `Examen_Heces_${exam.patient.name.replace(/\s+/g, '_')}_${this.formatDate(exam.testDate)}.pdf`;
    doc.save(fileName);
  }

  // ========== MÉTODOS AUXILIARES ==========
  
  private addSectionHeader(
    doc: jsPDF, 
    title: string, 
    x: number, 
    y: number, 
    width: number, 
    color: [number, number, number]
  ): void {
    doc.setFillColor(...color);
    doc.rect(x, y, width, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(title, x + 2, y + 4);
  }

  private addDataRow(
    doc: jsPDF, 
    label: string, 
    value: string, 
    x: number, 
    y: number, 
    width: number,
    shaded: boolean
  ): number {
    const rowHeight = 5;
    
    if (shaded) {
      doc.setFillColor(240, 248, 255);
      doc.rect(x, y - 3, width, rowHeight, 'F');
    }
    
    doc.setTextColor(51, 51, 51);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(label, x + 2, y);
    
    doc.setFont('helvetica', 'normal');
    doc.text(value || 'N/A', x + 60, y);
    
    return y + rowHeight;
  }

  private formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}