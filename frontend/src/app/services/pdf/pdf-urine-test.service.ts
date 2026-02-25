import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { UrineTest } from '../../models/urine-test.interface';


// Función para convertir una imagen a base64
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
export class PdfUrineTestService {

  constructor() { }

  async generateUrineReport(data: UrineTest): Promise<void> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yPos = 15;

    // Colores
    const primaryColor: [number, number, number] = [41, 128, 185];
    const secondaryColor: [number, number, number] = [240, 248, 255];
    const textColor: [number, number, number] = [51, 51, 51];

    
    try {
      
       // Cargar imágenes como Base64
      const logoLab = await loadImageAsBase64('assets/images/lab/logo_CMO_LABS.png');
      const infoContact = await loadImageAsBase64('assets/images/lab/info_contacto.png');
      // const microbiologo = await loadImageAsBase64('assets/images/lab/microbiologo.png');
      // const logoOgyne = await loadImageAsBase64('assets/images/lab/ògyne_sello.png');
      

      // Insertar las imágenes en el encabezado
      // (x, y, width, height)
      doc.addImage(logoLab, 'PNG', 15, 10, 50, 20);      // Izquierda
      doc.addImage(infoContact, 'PNG', 100, 10, 80, 20); // Derecha

    } catch (error) {
      console.error('Error cargando imágenes:', error);
      // Continuar generando el PDF sin las imágenes
    }
    
    yPos += 20;
    // Línea separadora
    // doc.setDrawColor(...primaryColor);
    // doc.setLineWidth(0.5);
    // doc.line(margin, yPos, pageWidth - margin, yPos);
    // yPos += 8;

    // TÍTULO DEL EXAMEN
    doc.setFillColor(...primaryColor);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('GENERAL DE ORINA', pageWidth / 2, yPos + 5.5, { align: 'center' });
    yPos += 12;

    // INFORMACIÓN DEL PACIENTE
    doc.setTextColor(...textColor);
    doc.setFontSize(9);
    
    const patientInfoY = yPos;

    doc.setFont('helvetica', 'bold');
    doc.text(`Paciente:`, margin, patientInfoY);
    doc.setFont('helvetica', 'normal');
    doc.text(data.patient?.name?.toUpperCase() || 'N/A', margin + 25, patientInfoY);
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Edad:`, margin + 120, patientInfoY);
    doc.setFont('helvetica', 'normal');
    doc.text(`${data.patient?.age || 0} Años`, margin + 135, patientInfoY);
    
    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.text(`DNI:`, margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.patient?.dni || 'N/A', margin + 25, yPos);
    
    doc.setFont('helvetica', 'bold');
    doc.text(`Sexo:`, margin + 120, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.patient?.sex === 'FEMALE' ? 'FEMENINO' : 'MASCULINO', margin + 135, yPos);
    
    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.text(`Fecha de nacimiento:`, margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.patient?.birthDate ? this.formatDate(data.patient.birthDate) : 'N/A', margin + 40, yPos);
    
    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.text(`Muestra #:`, margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.sampleNumber || 'N/A', margin + 40, yPos);
    
    yPos += 8;

    // EXAMEN FÍSICO
    this.addSectionHeader(doc, 'EXAMEN FÍSICO', margin, yPos, pageWidth - 2 * margin, primaryColor);
    yPos += 7;
    
    yPos = this.addDataRow(doc, 'VOLUMEN:', data.volume || 'N/A', margin, yPos, true);
    yPos = this.addDataRow(doc, 'COLOR:', data.color || 'N/A', margin, yPos, false);
    yPos = this.addDataRow(doc, 'ASPECTO:', data.aspect || 'N/A', margin, yPos, true);
    yPos = this.addDataRow(doc, 'SEDIMENTO:', data.sediment || 'N/A', margin, yPos, false);

    yPos += 3;

    // EXAMEN QUÍMICO
    this.addSectionHeader(doc, 'EXAMEN QUÍMICO', margin, yPos, pageWidth - 2 * margin, primaryColor);
    yPos += 7;
    
    yPos = this.addDataRow(doc, 'DENSIDAD:', data.density || 'N/A', margin, yPos, true);
    yPos = this.addDataRow(doc, 'PH:', data.ph || 'N/A', margin, yPos, false);
    yPos = this.addDataRow(doc, 'PROTEÍNA:', data.protein || 'N/A', margin, yPos, true);
    yPos = this.addDataRow(doc, 'GLUCOSA:', data.glucose || 'N/A', margin, yPos, false);
    yPos = this.addDataRow(doc, 'BILIRRUBINAS:', data.bilirubin || 'N/A', margin, yPos, true);
    yPos = this.addDataRow(doc, 'CETONAS:', data.ketones || 'N/A', margin, yPos, false);
    yPos = this.addDataRow(doc, 'SANGRE OCULTA:', data.occultBlood || 'N/A', margin, yPos, true);
    yPos = this.addDataRow(doc, 'NITRITOS:', data.nitrites || 'N/A', margin, yPos, false);
    yPos = this.addDataRow(doc, 'UROBILINÓGENO:', data.urobilinogen || 'N/A', margin, yPos, true);
    yPos = this.addDataRow(doc, 'LEUCOCITOS:', data.leukocytes || 'N/A', margin, yPos, false);
    
    yPos += 3;

    // EXAMEN MICROSCÓPICO
    this.addSectionHeader(doc, 'EXAMEN MICROSCÓPICO', margin, yPos, pageWidth - 2 * margin, primaryColor);
    yPos += 7;
    
    yPos = this.addDataRow(doc, 'CÉLULAS EPITELIALES:', data.epithelialCells || 'N/A', margin, yPos, true);
    yPos = this.addDataRow(doc, 'LEUCOCITOS:', data.leukocytesField || 'N/A', margin, yPos, false);
    yPos = this.addDataRow(doc, 'ERITROCITOS:', data.erythrocytesField || 'N/A', margin, yPos, true);
    yPos = this.addDataRow(doc, 'BACTERIAS:', data.bacteria || 'N/A', margin, yPos, false);
    yPos = this.addDataRow(doc, 'FILAMENTOS MUCOSOS:', data.mucousFilaments || 'N/A', margin, yPos, true);
    
    // CRISTALES
    if (data.crystals && data.crystals.length > 0) {
      const crystalsText = data.crystals.map(c => `${c.type} (${c.quantity})`).join(', ');
      yPos = this.addDataRow(doc, 'CRISTALES:', crystalsText, margin, yPos, false);
    } else {
      yPos = this.addDataRow(doc, 'CRISTALES:', 'No se observa', margin, yPos, false);
    }

    yPos = this.addDataRow(doc, 'LEVADURAS:', data.yeasts || 'N/A', margin, yPos, true);

    // CILINDROS
    if (data.cylinders && data.cylinders.length > 0) {
      const cylindersText = data.cylinders.map(c => `${c.type} (${c.quantity})`).join(', ');
      yPos = this.addDataRow(doc, 'CILINDROS:', cylindersText, margin, yPos, false);
    } else {
      yPos = this.addDataRow(doc, 'CILINDROS:', 'No se observa', margin, yPos, false);
    }

    yPos = this.addDataRow(doc, 'OTROS:', data.others || 'N/A', margin, yPos, true);

    yPos += 3;

    // OBSERVACIONES
    if (data.observations && data.observations.toLowerCase() !== 'ninguna') {
      this.addSectionHeader(doc, 'OBSERVACIONES:', margin, yPos, pageWidth - 2 * margin, primaryColor);
      yPos += 7;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textColor);
      doc.text(data.observations, margin + 2, yPos);
      yPos += 10;
    }

    // FIRMA Y SELLO
    //yPos = Math.max(yPos, 250); // Posicionar cerca del final
    try {
      
       // Cargar imágenes como Base64
      const microbiologo = await loadImageAsBase64('assets/images/lab/microbiologo.png');
      const logoOgyne = await loadImageAsBase64('assets/images/lab/ogyne_sello.png');
  
      yPos += 20;
      // Insertar las imágenes en el encabezado
      // (x, y, width, height)
      doc.addImage(microbiologo, 'PNG', 20, yPos, 40, 30);      // Izquierda
      doc.addImage(logoOgyne, 'PNG', 150, yPos, 30, 30); // Derecha

    } catch (error) {
      console.error('Error cargando imágenes:', error);
      // Continuar generando el PDF sin las imágenes
    }

    
    // Aquí agregar imagen de firma y sello
    // doc.addImage(firmaImage, 'JPEG', margin + 60, yPos, 40, 20);
    // doc.addImage(selloImage, 'JPEG', margin + 50, yPos - 10, 60, 30);
    
    // Guardar PDF
    doc.save(`Examen_Orina_${data.patient?.name.replace(/\s+/g, '_')}_${this.formatDate(data.testDate)}.pdf`);
  }

  private addSectionHeader(doc: jsPDF, title: string, x: number, y: number, width: number, color: [number, number, number]): void {
    doc.setFillColor(...color);
    doc.rect(x, y, width, 6, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(title, x + 2, y + 4);
  }

  private addDataRow(doc: jsPDF, label: string, value: string, x: number, y: number, shaded: boolean): number {
    const rowHeight = 5;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    
    if (shaded) {
      doc.setFillColor(240, 248, 255);
      doc.rect(x, y - 3, pageWidth - 2 * margin, rowHeight, 'F');
    }
    
    doc.setTextColor(51, 51, 51);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(label, x + 2, y);
    
    doc.setFont('helvetica', 'normal');
    doc.text(value, x + 60, y);
    
    return y + rowHeight;
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
