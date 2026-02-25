import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { LabResult } from '../models/lab-result.interface';
import { StoolTest } from '../models/stool-test.interface';
import { IChromaResult } from '../models/ichroma-result.interface';
import { UrineTest } from '../models/urine-test.interface';
import { ChartService } from './chart.service';
import { EscasaModeradaAbundanteAusenteQuantity } from '../enums/escasa-moderada-abundante-ausente.enums';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor(private chartService: ChartService) { }

  // Método para generar PDF de Lab Results (ya funcionando)
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

  // Método para generar PDF de Dymind DH36 - COMPLETO CON GRÁFICOS
  async generateDymindDh36Pdf(labResult: LabResult): Promise<void> {
    const doc = new jsPDF({
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    });
    
    // Configuración de colores
    const primaryColor = '#2c3e50';
    
    // Header compacto (0-20)
    this.addDymindCompactHeader(doc, primaryColor);
    
    // Información del paciente y muestra compacta (20-45)
    this.addDymindPatientInfo(doc, labResult, primaryColor);
    
    // Diseño de dos columnas: Tabla (izq) y Gráficos (der)
    await this.addDymindTwoColumnLayout(doc, labResult);
    
    // Footer con información adicional
    this.addDymindFooter(doc, labResult);
    
    // Generar y descargar el PDF
    const fileName = `Dymind_DH36_${labResult.sampleNumber}_${this.formatDateForFilename(labResult.testDate)}.pdf`;
    doc.save(fileName);
  }

  // Método para generar PDF de Stool Tests - OPTIMIZADO PARA UNA PÁGINA
  async generateStoolTestPdf(stoolTest: StoolTest): Promise<void> {
    const doc = new jsPDF({
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    });
    
    // Configuración de colores
    const primaryColor = '#2c3e50';
    const secondaryColor = '#2ecc71';
    
    // Header compacto (0-20mm) - Aumentado
    doc.setFillColor(44, 62, 80);
    doc.rect(0, 0, 210, 20, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('LABORATORIO CLÍNICO NEXOS', 105, 8, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('EXAMEN COPROLÓGICO COMPLETO', 105, 15, { align: 'center' });
    
    // Información del paciente y muestra (20-40mm) - Márgenes ampliados
    let yPos = 26;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN DEL PACIENTE', 15, yPos);
    doc.text('INFORMACIÓN DE LA MUESTRA', 115, yPos);
    
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    
    // Columna izquierda - Paciente (márgenes ampliados)
    doc.text(`Nombre: ${stoolTest.patient?.name || 'N/A'}`, 15, yPos);
    doc.text(`Edad: ${stoolTest.patient?.age || 'N/A'} años`, 15, yPos + 4);
    doc.text(`Sexo: ${stoolTest.patient?.sex || 'N/A'}`, 15, yPos + 8);

    // Columna derecha - Muestra (márgenes ampliados)
    doc.text(`N° Muestra: ${stoolTest.sampleNumber || 'N/A'}`, 115, yPos);
    doc.text(`Fecha: ${this.formatDateTime(stoolTest.testDate)}`, 115, yPos + 4);
    doc.text(`Técnico: ${stoolTest.createdBy?.name + ' ' + stoolTest.createdBy?.lastName || 'N/A'}`, 115, yPos + 8);
    
    // EXAMEN FÍSICO Y MICROSCÓPICO (40-75mm) - Títulos alineados
    yPos = 46;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    // Títulos alineados a la misma altura
    doc.text('EXAMEN FÍSICO', 15, yPos);
    doc.text('EXAMEN MICROSCÓPICO', 115, yPos);
    
    yPos += 5;
    const physicalData = [
      ['Parámetro', 'Resultado'],
      ['Color', stoolTest.color || 'N/A'],
      ['Consistencia', stoolTest.consistency || 'N/A'],
      ['Forma', stoolTest.shape || 'N/A'],
      ['Moco', stoolTest.mucus || 'N/A']
    ];
    
    autoTable(doc, {
      startY: yPos,
      head: physicalData.slice(0, 1),
      body: physicalData.slice(1),
      theme: 'grid',
      headStyles: {
        fillColor: [46, 204, 113],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 8,
        textColor: 0
      },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'bold' },
        1: { cellWidth: 45 }
      },
      margin: { left: 15, right: 115 },
      tableLineWidth: 0.2,
      tableLineColor: [180, 180, 180]
    });
    
    // EXAMEN MICROSCÓPICO (tabla derecha, misma altura)
    const microscopicData = [
      ['Parámetro', 'Resultado'],
      ['Leucocitos', stoolTest.leukocytes || 'N/A'],
      ['Eritrocitos', stoolTest.erythrocytes || 'N/A']
    ];
    
    autoTable(doc, {
      startY: yPos,
      head: microscopicData.slice(0, 1),
      body: microscopicData.slice(1),
      theme: 'grid',
      headStyles: {
        fillColor: [46, 204, 113],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 8,
        textColor: 0
      },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'bold' },
        1: { cellWidth: 45 }
      },
      margin: { left: 115, right: 15 },
      tableLineWidth: 0.2,
      tableLineColor: [180, 180, 180]
    });
    
    // EXAMEN PARASITOLÓGICO (75-100mm) - Mejorado
    yPos = 80;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('EXAMEN PARASITOLÓGICO', 15, yPos);
    
    yPos += 5;
    doc.setDrawColor(46, 204, 113);
    doc.setLineWidth(0.3);
    doc.rect(15, yPos - 1, 180, 18);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    // Verificar si parasites es un arreglo con elementos
    const hasParasites = Array.isArray(stoolTest.parasites) && stoolTest.parasites.length > 0;
    
    if (hasParasites) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(220, 20, 60); // Rojo para hallazgos positivos
      doc.text('⚠️ HALLAZGO POSITIVO:', 17, yPos + 4);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      // Convertir array a string legible
      const parasitesText = stoolTest.parasites.join(', ');
      doc.text(parasitesText, 17, yPos + 8);
      doc.text('SE RECOMIENDA TRATAMIENTO ANTIPARASITARIO', 17, yPos + 12);
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(34, 139, 34); // Verde para negativo
      doc.setFontSize(8);
      doc.text('✓ NO SE OBSERVAN PARÁSITOS EN ESTA MUESTRA', 17, yPos + 8);
    }
    
    // OBSERVACIONES (100-125mm) - Mejorado
    yPos = 103;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('OBSERVACIONES', 15, yPos);
    
    yPos += 5;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.rect(15, yPos - 1, 180, 18);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    if (stoolTest.observations) {
      const observations = doc.splitTextToSize(stoolTest.observations, 174);
      doc.text(observations, 17, yPos + 4);
    } else {
      doc.text('Sin observaciones adicionales registradas.', 17, yPos + 4);
    }
    
    // INTERPRETACIÓN AUTOMÁTICA (125-160mm) - Mejorado
    yPos = 128;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('INTERPRETACIÓN', 15, yPos);
    
    yPos += 5;
    doc.setDrawColor(52, 152, 219);
    doc.setLineWidth(0.2);
    doc.rect(15, yPos - 1, 180, 28);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    const interpretation = this.generateStoolTestInterpretation(stoolTest);
    const interpretationLines = doc.splitTextToSize(interpretation, 174);
    doc.text(interpretationLines, 17, yPos + 4);
    
    // FOOTER MEJORADO (165-180mm)
    yPos = 168;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    
    doc.text('Este reporte fue generado automáticamente por el sistema de laboratorio', 105, yPos, { align: 'center' });
    doc.text(`Estado: ${this.translateStoolTestStatus(stoolTest.status)} | Generado: ${new Date().toLocaleString('es-ES')}`, 105, yPos + 4, { align: 'center' });
    
    if (stoolTest.reviewedBy) {
      doc.text(`Revisado por: ${stoolTest.reviewedBy}`, 105, yPos + 8, { align: 'center' });
    }
    
    // Generar y descargar el PDF
    const fileName = `Examen_Coprologico_${stoolTest.sampleNumber}_${this.formatDateForFilename(stoolTest.testDate)}.pdf`;
    doc.save(fileName);
  }

  // Método para generar PDF de iChroma II - OPTIMIZADO PARA UNA PÁGINA
  async generateIChromaResultPdf(ichromaResult: IChromaResult): Promise<void> {
    const doc = new jsPDF({
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    });
    
    // Configuración de colores
    const primaryColor = '#2c3e50';
    const secondaryColor = '#e74c3c';
    
    // Header compacto (0-20mm)
    doc.setFillColor(44, 62, 80);
    doc.rect(0, 0, 210, 20, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('LABORATORIO CLÍNICO NEXOS', 105, 8, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('RESULTADO iChroma II - QUÍMICA CLÍNICA', 105, 15, { align: 'center' });
    
    // Información del paciente y prueba (20-45mm)
    let yPos = 26;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN DEL PACIENTE', 15, yPos);
    doc.text('INFORMACIÓN DE LA PRUEBA', 115, yPos);
    
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    
    // Columna izquierda - Paciente
    doc.text(`Nombre: ${ichromaResult.patientNameIchroma2 || 'N/A'}`, 15, yPos);
    doc.text(`ID Paciente: ${ichromaResult.patientIdIchroma2 || 'N/A'}`, 15, yPos + 4);
    doc.text(`Edad: ${ichromaResult.patientAgeIchroma2 ? ichromaResult.patientAgeIchroma2 + ' años' : 'N/A'}`, 15, yPos + 8);
    doc.text(`Sexo: ${ichromaResult.patientSexIchroma2 || 'N/A'}`, 15, yPos + 12);
    
    // Columna derecha - Prueba
    doc.text(`Prueba: ${ichromaResult.testName || 'N/A'}`, 115, yPos);
    doc.text(`Código: ${ichromaResult.testType || 'N/A'}`, 115, yPos + 4);
    doc.text(`Fecha Test: ${this.formatDateTime(ichromaResult.testDate)}`, 115, yPos + 8);
    doc.text(`Instrumento: ${ichromaResult.instrumentId || 'iChroma II'}`, 115, yPos + 12);
    
    // RESULTADO PRINCIPAL - Destacado (50-85mm)
    yPos = 52;
    doc.setFillColor(231, 76, 60);
    doc.rect(15, yPos - 2, 180, 25, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('RESULTADO', 105, yPos + 4, { align: 'center' });
    
    doc.setFontSize(20);
    const resultText = `${ichromaResult.result || 'N/A'} ${ichromaResult.unit || ''}`;
    doc.text(resultText, 105, yPos + 14, { align: 'center' });
    
    // Estado del resultado basado en referencias
    let resultStatus = 'NORMAL';
    let statusColor = 'Normal';
    if (ichromaResult.referenceMin !== null || ichromaResult.referenceMax !== null) {
      const numResult = parseFloat(ichromaResult.result);
      if (!isNaN(numResult)) {
        if (ichromaResult.referenceMin !== null && numResult < ichromaResult.referenceMin) {
          resultStatus = 'BAJO';
          statusColor = 'Bajo';
        } else if (ichromaResult.referenceMax !== null && numResult > ichromaResult.referenceMax) {
          resultStatus = 'ALTO';
          statusColor = 'Alto';
        }
      }
    }
    
    doc.setFontSize(10);
    doc.text(`Estado: ${resultStatus}`, 105, yPos + 20, { align: 'center' });
    
    // VALORES DE REFERENCIA (85-110mm)
    yPos = 88;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('VALORES DE REFERENCIA', 15, yPos);
    
    yPos += 5;
    const referenceData = [
      ['Parámetro', 'Valor Obtenido', 'Unidad', 'Rango de Referencia', 'Estado']
    ];
    
    const refMin = ichromaResult.referenceMin !== null ? ichromaResult.referenceMin.toString() : 'N/A';
    const refMax = ichromaResult.referenceMax !== null ? ichromaResult.referenceMax.toString() : 'N/A';
    const referenceRange = (refMin !== 'N/A' || refMax !== 'N/A') ? `${refMin} - ${refMax}` : 'No establecido';
    
    referenceData.push([
      ichromaResult.testName || 'N/A',
      ichromaResult.result || 'N/A',
      ichromaResult.unit || '',
      referenceRange,
      statusColor
    ]);
    
    autoTable(doc, {
      startY: yPos,
      head: referenceData.slice(0, 1),
      body: referenceData.slice(1),
      theme: 'grid',
      headStyles: {
        fillColor: [231, 76, 60],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 8,
        textColor: 0
      },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'bold' },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 35, halign: 'center' },
        4: { cellWidth: 20, halign: 'center', fontStyle: 'bold' }
      },
      margin: { left: 15, right: 15 },
      tableLineWidth: 0.2,
      tableLineColor: [180, 180, 180]
    });
    
    // INFORMACIÓN TÉCNICA (115-145mm)
    yPos = 118;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN TÉCNICA DEL ANÁLISIS', 15, yPos);
    
    yPos += 5;
    const technicalData = [
      ['Aspecto Técnico', 'Valor'],
      ['Serial Cartucho', ichromaResult.cartridgeSerial || 'N/A'],
      ['Lote Cartucho', ichromaResult.cartridgeLot || 'N/A'],
      ['Código Muestra', ichromaResult.sampleBarcode || 'N/A'],
      ['Humedad', ichromaResult.humidity ? ichromaResult.humidity + '%' : 'N/A'],
      ['Estado Procesamiento', ichromaResult.processingStatus || 'N/A']
    ];
    
    autoTable(doc, {
      startY: yPos,
      head: technicalData.slice(0, 1),
      body: technicalData.slice(1),
      theme: 'grid',
      headStyles: {
        fillColor: [231, 76, 60],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 8,
        textColor: 0
      },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: 'bold' },
        1: { cellWidth: 60 }
      },
      margin: { left: 15, right: 70 },
      tableLineWidth: 0.2,
      tableLineColor: [180, 180, 180]
    });
    
    // INTERPRETACIÓN CLÍNICA (150-175mm)
    yPos = 152;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('INTERPRETACIÓN CLÍNICA', 15, yPos);
    
    yPos += 5;
    doc.setDrawColor(231, 76, 60);
    doc.setLineWidth(0.2);
    doc.rect(15, yPos - 1, 180, 20);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    const interpretation = this.generateIChromaInterpretation(ichromaResult);
    const interpretationLines = doc.splitTextToSize(interpretation, 174);
    doc.text(interpretationLines, 17, yPos + 4);
    
    // NOTAS TÉCNICAS (si existen) (175-185mm)
    if (ichromaResult.technicalNotes) {
      yPos = 177;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('NOTAS TÉCNICAS:', 15, yPos);
      
      doc.setFont('helvetica', 'normal');
      const notesLines = doc.splitTextToSize(ichromaResult.technicalNotes, 174);
      doc.text(notesLines, 17, yPos + 4);
    }
    
    // FOOTER (185-195mm)
    yPos = 187;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    
    doc.text('Este reporte fue generado automáticamente por el sistema iChroma II', 105, yPos, { align: 'center' });
    doc.text(`Estado: ${ichromaResult.processingStatus || 'Completado'} | Generado: ${new Date().toLocaleString('es-ES')}`, 105, yPos + 4, { align: 'center' });
    doc.text(`Instrumento: ${ichromaResult.instrumentId} | ID Dispositivo: ${ichromaResult.deviceId || 'N/A'}`, 105, yPos + 8, { align: 'center' });
    
    // Generar y descargar el PDF
    const fileName = `iChroma_II_${ichromaResult.testName}_${ichromaResult.patientNameIchroma2}_${this.formatDateForFilename(ichromaResult.testDate)}.pdf`;
    doc.save(fileName);
  }

  // Método para generar PDF de Urine Tests - OPTIMIZADO PARA UNA PÁGINA
  async generateUrineTestPdf(urineTest: UrineTest): Promise<void> {
    const doc = new jsPDF({
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait'
    });
    
    // Configuración de colores
    const primaryColor = '#2c3e50';
    const secondaryColor = '#f39c12';
    
    // Header compacto (0-20mm)
    doc.setFillColor(44, 62, 80);
    doc.rect(0, 0, 210, 20, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('LABORATORIO CLÍNICO NEXOS', 105, 8, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('EXAMEN GENERAL DE ORINA', 105, 15, { align: 'center' });
    
    // Información del paciente y muestra (20-40mm)
    let yPos = 26;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN DEL PACIENTE', 15, yPos);
    doc.text('INFORMACIÓN DE LA MUESTRA', 115, yPos);
    
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    
    // Columna izquierda - Paciente
    doc.text(`Paciente: ${urineTest.patient?.name || 'N/A'}`, 15, yPos);
    doc.text(`Edad: ${urineTest.patient?.age ? urineTest.patient.age + ' años' : 'N/A'}`, 15, yPos + 4);
    // doc.text(`Sexo: ${urineTest.patient?.patientGender || 'N/A'}`, 15, yPos + 8);
    
    // Columna derecha - Muestra
    doc.text(`ID Muestra: ${urineTest.id}`, 115, yPos);
    doc.text(`Fecha Test: ${this.formatDateTime(urineTest.testDate)}`, 115, yPos + 4);
    doc.text(`Muestra #: ${urineTest?.sampleNumber}`, 115, yPos + 8);
    
    // EXAMEN FÍSICO (40-65mm)
    yPos = 46;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('EXAMEN FÍSICO', 15, yPos);
    
    yPos += 5;
    const physicalData = [
      ['Parámetro', 'Resultado'],
      ['Volumen', urineTest.volume || 'N/A'],
      ['Color', urineTest.color || 'N/A'],
      ['Aspecto', urineTest.aspect || 'N/A'],
      ['Sedimento', urineTest.sediment || 'N/A']
    ];
    
    autoTable(doc, {
      startY: yPos,
      head: physicalData.slice(0, 1),
      body: physicalData.slice(1),
      theme: 'grid',
      headStyles: {
        fillColor: [243, 156, 18],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 8,
        textColor: 0
      },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'bold' },
        1: { cellWidth: 45 }
      },
      margin: { left: 15, right: 110 },
      tableLineWidth: 0.2,
      tableLineColor: [180, 180, 180]
    });
    
    // EXAMEN QUÍMICO (lado derecho del físico, misma altura)
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('EXAMEN QUÍMICO', 115, 51);
    
    const chemicalData = [
      ['Parámetro', 'Resultado'],
      ['Densidad', urineTest.density || 'N/A'],
      ['Proteína', urineTest.protein || 'N/A'],
      ['Glucosa', urineTest.glucose || 'N/A'],
      ['Bilirrubina', urineTest.bilirubin || 'N/A'],
      ['Urobilinógeno', urineTest.urobilinogen || 'N/A'],
      ['Nitritos', urineTest.nitrites || 'N/A'],
      ['Leucocitos', urineTest.leukocytes || 'N/A']
    ];
    
    autoTable(doc, {
      startY: 56,
      head: chemicalData.slice(0, 1),
      body: chemicalData.slice(1),
      theme: 'grid',
      headStyles: {
        fillColor: [243, 156, 18],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 8,
        textColor: 0
      },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'bold' },
        1: { cellWidth: 40 }
      },
      margin: { left: 115, right: 15 },
      tableLineWidth: 0.2,
      tableLineColor: [180, 180, 180]
    });
    
    // EXAMEN MICROSCÓPICO (90-120mm) - Ocupando todo el ancho
    yPos = 95;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('EXAMEN MICROSCÓPICO', 15, yPos);
    
    yPos += 5;
    
    // Formatear cristales y cilindros para mostrar en PDF
    const crystalsText = this.formatCrystalsForPdf(urineTest.crystals);
    const cylindersText = this.formatCylindersForPdf(urineTest.cylinders);
    
    const microscopicData = [
      ['Parámetro', 'Resultado', 'Parámetro', 'Resultado'],
      ['Células Epiteliales', urineTest.epithelialCells || 'N/A', 'Bacterias', urineTest.bacteria || 'N/A'],
      ['Filamentos Mucosos', urineTest.mucousFilaments || 'N/A', 'Levaduras', urineTest.yeasts || 'N/A'],
      ['Leucocitos/campo', urineTest.leukocytesField || 'N/A', 'Eritrocitos/campo', urineTest.erythrocytesField || 'N/A'],
      ['Cristales', crystalsText, 'Cilindros', cylindersText]
    ];
    
    autoTable(doc, {
      startY: yPos,
      head: microscopicData.slice(0, 1),
      body: microscopicData.slice(1),
      theme: 'grid',
      headStyles: {
        fillColor: [243, 156, 18],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 8,
        textColor: 0
      },
      columnStyles: {
        0: { cellWidth: 42, fontStyle: 'bold' },
        1: { cellWidth: 38 },
        2: { cellWidth: 42, fontStyle: 'bold' },
        3: { cellWidth: 38 }
      },
      margin: { left: 15, right: 15 },
      tableLineWidth: 0.2,
      tableLineColor: [180, 180, 180]
    });
    
    // OBSERVACIONES Y OTROS HALLAZGOS (125-145mm)
    yPos = 128;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('OBSERVACIONES Y OTROS HALLAZGOS', 15, yPos);
    
    yPos += 5;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.rect(15, yPos - 1, 180, 18);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    let observationText = '';
    if (urineTest.observations) {
      observationText += `Observaciones: ${urineTest.observations}\n`;
    }
    if (urineTest.others) {
      observationText += `Otros hallazgos: ${urineTest.others}\n`;
    }
    if (!observationText) {
      observationText = 'Sin observaciones adicionales registradas.';
    }
    
    const observationLines = doc.splitTextToSize(observationText, 174);
    doc.text(observationLines, 17, yPos + 4);
    
    // INTERPRETACIÓN AUTOMÁTICA (150-175mm)
    yPos = 152;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('INTERPRETACIÓN', 15, yPos);
    
    yPos += 5;
    doc.setDrawColor(52, 152, 219);
    doc.setLineWidth(0.2);
    doc.rect(15, yPos - 1, 180, 20);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    const interpretation = this.generateUrineTestInterpretation(urineTest);
    const interpretationLines = doc.splitTextToSize(interpretation, 174);
    doc.text(interpretationLines, 17, yPos + 4);
    
    // FOOTER (175-185mm)
    yPos = 178;
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    
    doc.text('Este reporte fue generado automáticamente por el sistema de laboratorio', 105, yPos, { align: 'center' });
    doc.text(`Estado: ${urineTest.status || 'Completado'} | Técnico: ${urineTest.createdBy?.name  || 'N/A'}`, 105, yPos + 4, { align: 'center' });
    doc.text(`Generado el: ${new Date().toLocaleString('es-ES')}`, 105, yPos + 8, { align: 'center' });
    
    // Generar y descargar el PDF
    const patientName = urineTest.patient?.name || 'Paciente';
    const fileName = `Examen_Orina_${patientName}_${this.formatDateForFilename(urineTest.testDate)}.pdf`;
    doc.save(fileName);
  }

  // Métodos auxiliares básicos
  private addCompactHeader(doc: jsPDF, primaryColor: string): void {
    // Implementación básica del header
    doc.setFillColor(44, 62, 80);
    doc.rect(0, 0, 210, 20, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('LABORATORIO CLÍNICO NEXOS', 105, 12, { align: 'center' });
  }

  private addCompactPatientInfo(doc: jsPDF, labResult: LabResult, color: string): void {
    // Implementación básica de información del paciente
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Paciente: ${labResult.patientName || 'N/A'}`, 10, 30);
    doc.text(`Muestra: ${labResult.sampleNumber || 'N/A'}`, 10, 35);
  }

  private async addTwoColumnLayout(doc: jsPDF, labResult: LabResult): Promise<void> {
    // Implementación básica de layout
    doc.setFontSize(12);
    doc.text('RESULTADOS DE LABORATORIO', 10, 50);
    
    if (labResult.parameters && labResult.parameters.length > 0) {
      const tableData = labResult.parameters.map(param => [
        this.getParameterDisplayName(param.name),
        param.result || 'N/A',
        param.unit || '',
        this.translateParameterStatus(param.status)
      ]);

      autoTable(doc, {
        startY: 55,
        head: [['Parámetro', 'Valor', 'Unidad', 'Estado']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [44, 62, 80],
          textColor: 255,
          fontSize: 10
        },
        bodyStyles: {
          fontSize: 9
        }
      });
    }
  }

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

  // Métodos auxiliares específicos para Stool Test
  private generateStoolTestInterpretation(stoolTest: StoolTest): string {
    let interpretation = '';
    
    // Evaluación general
    const hasAbnormalFindings = this.hasAbnormalStoolFindings(stoolTest);
    
    if (!hasAbnormalFindings) {
      interpretation += 'RESULTADO: EXAMEN DENTRO DE PARÁMETROS NORMALES\n\n';
      interpretation += '• Características físicas normales\n';
      interpretation += '• Ausencia de elementos patológicos microscópicos\n';
      interpretation += '• No se observan parásitos intestinales\n\n';
      interpretation += 'RECOMENDACIONES:\n';
      interpretation += '• Mantener medidas de higiene personal\n';
      interpretation += '• Dieta balanceada y consumo de agua potable';
    } else {
      interpretation += 'RESULTADO: SE DETECTARON HALLAZGOS SIGNIFICATIVOS\n\n';
      
      // Evaluar parásitos - verificar si es un arreglo con elementos
      const hasParasites = Array.isArray(stoolTest.parasites) && stoolTest.parasites.length > 0;
      if (hasParasites) {
        const parasitesText = stoolTest.parasites.join(', ');
        interpretation += `• PARASITOSIS DETECTADA: ${parasitesText}\n`;
        interpretation += '  → Requiere tratamiento antiparasitario específico\n';
      }
      
      // Evaluar elementos microscópicos anormales
      if (stoolTest.leukocytes === EscasaModeradaAbundanteAusenteQuantity.ABUNDANTE) {
        interpretation += '• Leucocitos aumentados: Indica proceso inflamatorio intestinal\n';
      }
      
      if (stoolTest.erythrocytes !== EscasaModeradaAbundanteAusenteQuantity.NO_SE_OBSERVA) {
        interpretation += '• Eritrocitos presentes: Sugiere posible sangrado digestivo\n';
      }
      
      interpretation += '\nRECOMENDACIONES:\n';
      interpretation += '• Consultar inmediatamente con médico tratante\n';
      interpretation += '• Seguir indicaciones terapéuticas específicas\n';
      interpretation += '• Control post-tratamiento según criterio médico';
    }
    
    return interpretation;
  }

  private hasAbnormalStoolFindings(stoolTest: StoolTest): boolean {
    // Verificar si parasites es un arreglo con elementos
    const hasParasites = Array.isArray(stoolTest.parasites) && stoolTest.parasites.length > 0;
    
    return hasParasites ||
           stoolTest.leukocytes === EscasaModeradaAbundanteAusenteQuantity.ABUNDANTE ||
           stoolTest.erythrocytes !== EscasaModeradaAbundanteAusenteQuantity.NO_SE_OBSERVA;
  }

  private translateStoolTestStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pendiente',
      'completed': 'Completado',
      'reviewed': 'Revisado'
    };
    return statusMap[status] || status;
  }

  // Método para generar interpretación automática del examen de orina
  private generateUrineTestInterpretation(urineTest: UrineTest): string {
    const findings: string[] = [];
    
    // Análisis físico
    if (urineTest.color && (urineTest.color.includes('Rojizo') || urineTest.color.includes('Rojo'))) {
      findings.push('Color rojizo sugiere posible hematuria');
    }
    if (urineTest.aspect && urineTest.aspect.includes('Turbio')) {
      findings.push('Aspecto turbio puede indicar infección o cristaluria');
    }
    
    // Análisis químico - usando valores correctos del enum
    if (urineTest.protein && urineTest.protein !== 'Negativo') {
      findings.push('Presencia de proteínas (proteinuria)');
    }
    if (urineTest.glucose && urineTest.glucose !== 'Negativo') {
      findings.push('Presencia de glucosa (glucosuria)');
    }
    if (urineTest.nitrites && urineTest.nitrites === 'Positivo') {
      findings.push('Nitritos positivos sugieren infección bacteriana');
    }
    if (urineTest.leukocytes && urineTest.leukocytes !== 'Negativo') {
      findings.push('Leucocitos elevados indican proceso inflamatorio');
    }
    
    // Análisis microscópico - usando valores correctos del enum
    if (urineTest.bacteria && (urineTest.bacteria === EscasaModeradaAbundanteAusenteQuantity.MODERADA || urineTest.bacteria === EscasaModeradaAbundanteAusenteQuantity.ABUNDANTE)) {
      findings.push('Bacterias abundantes confirman infección urinaria');
    }
    if (urineTest.crystals && Array.isArray(urineTest.crystals) && urineTest.crystals.length > 0) {
      findings.push('Presencia de cristales - evaluar riesgo de litiasis');
    }
    if (urineTest.cylinders && Array.isArray(urineTest.cylinders) && urineTest.cylinders.length > 0) {
      findings.push('Cilindros presentes - posible compromiso renal');
    }
    
    if (findings.length === 0) {
      return 'RESULTADO: EXAMEN DENTRO DE PARÁMETROS NORMALES\n\nNo se observan alteraciones significativas en los parámetros evaluados. Mantener medidas de higiene y hidratación adecuada.';
    } else {
      return `RESULTADO: HALLAZGOS SIGNIFICATIVOS DETECTADOS\n\n• ${findings.join('\n• ')}\n\nRECOMENDACIONES:\n• Consultar con médico tratante para evaluación clínica\n• Seguir indicaciones terapéuticas específicas según criterio médico`;
    }
  }

  // Método para generar interpretación automática del iChroma II
  private generateIChromaInterpretation(ichromaResult: IChromaResult): string {
    const testName = ichromaResult.testName || 'Prueba';
    const result = ichromaResult.result || 'N/A';
    const unit = ichromaResult.unit || '';
    
    // Determinar estado del resultado
    let resultStatus = 'DENTRO DEL RANGO NORMAL';
    let recommendations = [];
    
    // Convertir resultado a número para análisis
    const numResult = parseFloat(result);
    
    if (ichromaResult.referenceMin !== null || ichromaResult.referenceMax !== null) {
      if (!isNaN(numResult)) {
        if (ichromaResult.referenceMin !== null && numResult < ichromaResult.referenceMin) {
          resultStatus = 'VALOR DISMINUIDO';
          recommendations.push('Se requiere evaluación médica para determinar significado clínico del valor bajo');
        } else if (ichromaResult.referenceMax !== null && numResult > ichromaResult.referenceMax) {
          resultStatus = 'VALOR ELEVADO';
          recommendations.push('Se requiere evaluación médica para determinar significado clínico del valor elevado');
        } else {
          recommendations.push('Valor dentro del rango de referencia normal');
        }
      }
    }
    
    // Interpretaciones específicas por tipo de prueba
    const specificInterpretations = this.getSpecificIChromaInterpretation(ichromaResult.testType, numResult);
    if (specificInterpretations.length > 0) {
      recommendations.push(...specificInterpretations);
    }
    
    // Construir interpretación final
    let interpretation = `ANÁLISIS DE ${testName.toUpperCase()}\n\n`;
    interpretation += `RESULTADO OBTENIDO: ${result} ${unit}\n`;
    interpretation += `EVALUACIÓN: ${resultStatus}\n\n`;
    
    if (recommendations.length > 0) {
      interpretation += 'CONSIDERACIONES CLÍNICAS:\n';
      interpretation += recommendations.map(rec => `• ${rec}`).join('\n');
    } else {
      interpretation += 'RECOMENDACIONES:\n• Correlacionar con cuadro clínico del paciente\n• Consultar con médico tratante para interpretación específica';
    }
    
    return interpretation;
  }

  // Interpretaciones específicas por tipo de prueba iChroma
  private getSpecificIChromaInterpretation(testType: string, numResult: number): string[] {
    const interpretations: string[] = [];
    
    if (!testType || isNaN(numResult)) return interpretations;
    
    switch (testType.toUpperCase()) {
      case 'SL033': // Beta HCG
        if (numResult > 5) {
          interpretations.push('Resultado compatible con embarazo - confirmar con seguimiento');
        } else {
          interpretations.push('Resultado negativo para embarazo');
        }
        break;
        
      case 'SL001': // PSA
        if (numResult > 4) {
          interpretations.push('PSA elevado - requiere evaluación urológica');
        } else if (numResult > 2.5) {
          interpretations.push('PSA en zona intermedia - considerar seguimiento');
        }
        break;
        
      case 'SL015': // Troponina I
        if (numResult > 0.04) {
          interpretations.push('Troponina elevada - compatible con daño miocárdico');
        }
        break;
        
      case 'SL025': // CRP
        if (numResult > 3) {
          interpretations.push('Proteína C Reactiva elevada - indica proceso inflamatorio');
        }
        break;
        
      default:
        interpretations.push('Correlacionar resultado con valores de referencia específicos');
        break;
    }
    
    return interpretations;
  }

  // ========== MÉTODOS AUXILIARES ESPECÍFICOS PARA DYMIND DH36 CON GRÁFICOS ==========

  private addDymindCompactHeader(doc: jsPDF, color: string): void {
    // Header compacto - solo 20px de altura
    doc.setFillColor(44, 62, 80);
    doc.rect(0, 0, 210, 20, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('LABORATORIO CLÍNICO NEXOS', 105, 8, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('RESULTADO DYMIND DH36 - HEMATOLOGÍA COMPLETA', 105, 15, { align: 'center' });
  }

  private addDymindPatientInfo(doc: jsPDF, labResult: LabResult, color: string): void {
    // Info del paciente compacta
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    const y = 26;
    doc.text(`Paciente: ${labResult.patientName || 'N/A'}`, 10, y);
    doc.text(`ID: ${labResult.sampleNumber}`, 80, y);
    doc.text(`Edad: ${labResult.patientAge || 'N/A'}`, 115, y);
    doc.text(`Sexo: ${labResult.patientSex || 'N/A'}`, 145, y);
    doc.text(`Fecha: ${this.formatDateTime(labResult.testDate).split(' ')[0]}`, 170, y);
  }

  private async addDymindTwoColumnLayout(doc: jsPDF, labResult: LabResult): Promise<void> {
    const startY = 35;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    
    // División balanceada de columnas
    const leftX = margin;
    const leftWidth = (pageWidth * 0.58) - margin; // 58% para tabla
    const rightX = leftX + leftWidth + 8; // gap de 8
    const rightWidth = pageWidth - rightX - margin; // resto para gráficos
    
    // Tabla con tamaños razonables
    this.addDymindBalancedTable(doc, labResult, leftX, startY, leftWidth);
    
    // Gráficos de tamaño adecuado
    await this.addDymindSizedCharts(doc, labResult, rightX, startY, rightWidth);
  }

  private addDymindBalancedTable(doc: jsPDF, labResult: LabResult, x: number, y: number, width: number): void {
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
      this.getDymindStatusText(param.status)
    ]);

    // Tabla con proporciones equilibradas
    autoTable(doc, {
      startY: y + 5,
      head: [['Parámetro', 'Resultado', 'Unidad', 'Estado']],
      body: tableData,
      margin: { left: x, right: 210 - (x + width) },
      tableWidth: width,
      theme: 'grid',
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

  private async addDymindSizedCharts(doc: jsPDF, labResult: LabResult, x: number, y: number, width: number): Promise<void> {
    const chartWidth = Math.min(width - 5, 50); // Máximo 50, mínimo width-5
    const chartHeight = 35;
    const spacing = 45;
    let currentY = y + 10;

    // Título de la sección
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('ANÁLISIS GRÁFICO', x, y);

    // WBC Chart
    if (this.chartService.hasWBCData(labResult.parameters)) {
      try {
        const wbcConfig = this.chartService.createWBCChart(labResult.parameters);
        const wbcImage = await this.chartService.generateChartImage(wbcConfig, 300, 180);
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('Serie Blanca (WBC)', x, currentY);
        
        if (wbcImage && wbcImage.includes('data:image/png;base64,') && wbcImage.length > 500) {
          doc.addImage(wbcImage, 'PNG', x, currentY + 3, chartWidth, chartHeight);
        } else {
          this.addChartPlaceholder(doc, x, currentY + 3, chartWidth, chartHeight, 'WBC');
        }
        currentY += spacing;
      } catch (error) {
        console.error('Error WBC:', error);
        this.addChartPlaceholder(doc, x, currentY + 3, chartWidth, chartHeight, 'WBC Error');
        currentY += spacing;
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
        
        if (rbcImage && rbcImage.includes('data:image/png;base64,') && rbcImage.length > 500) {
          doc.addImage(rbcImage, 'PNG', x, currentY + 3, chartWidth, chartHeight);
        } else {
          this.addChartPlaceholder(doc, x, currentY + 3, chartWidth, chartHeight, 'RBC');
        }
        currentY += spacing;
      } catch (error) {
        console.error('Error RBC:', error);
        this.addChartPlaceholder(doc, x, currentY + 3, chartWidth, chartHeight, 'RBC Error');
        currentY += spacing;
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
        
        if (pltImage && pltImage.includes('data:image/png;base64,') && pltImage.length > 500) {
          doc.addImage(pltImage, 'PNG', x, currentY + 3, chartWidth, chartHeight);
        } else {
          this.addChartPlaceholder(doc, x, currentY + 3, chartWidth, chartHeight, 'PLT');
        }
      } catch (error) {
        console.error('Error PLT:', error);
        this.addChartPlaceholder(doc, x, currentY + 3, chartWidth, chartHeight, 'PLT Error');
      }
    }
  }

  private addChartPlaceholder(doc: jsPDF, x: number, y: number, width: number, height: number, label: string): void {
    // Crear un rectángulo con texto de respaldo
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(248, 249, 250);
    doc.rect(x, y, width, height, 'FD');
    
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(label, x + (width / 2), y + (height / 2), { align: 'center' });
  }

  private addDymindFooter(doc: jsPDF, labResult: LabResult): void {
    const pageHeight = doc.internal.pageSize.height;
    const yPos = pageHeight - 25;
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    
    doc.text('Este reporte fue generado automáticamente por el sistema Dymind DH36', 105, yPos, { align: 'center' });
    doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 105, yPos + 4, { align: 'center' });
    doc.text(`Muestra: ${labResult.sampleNumber} | Paciente: ${labResult.patientName}`, 105, yPos + 8, { align: 'center' });
  }

  private getDymindStatusText(status: string): string {
    if (!status) return 'Normal';
    if (status.includes('H')) return 'Alto';
    if (status.includes('L')) return 'Bajo';
    if (status === 'N' || status === '~N') return 'Normal';
    return status;
  }

  // Métodos auxiliares para formatear arrays en PDF
  private formatCrystalsForPdf(crystals: any): string {
    if (!crystals) return 'No se observa';
    if (Array.isArray(crystals)) {
      if (crystals.length === 0) return 'No se observa';
      return crystals.map(c => `${c.type}: ${c.quantity}`).join(', ');
    }
    return crystals.toString();
  }

  private formatCylindersForPdf(cylinders: any): string {
    if (!cylinders) return 'No se observa';
    if (Array.isArray(cylinders)) {
      if (cylinders.length === 0) return 'No se observa';
      return cylinders.map(c => `${c.type}: ${c.quantity}`).join(', ');
    }
    return cylinders.toString();
  }
}
