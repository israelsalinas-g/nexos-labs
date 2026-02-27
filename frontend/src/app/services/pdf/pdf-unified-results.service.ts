import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PdfBaseService } from './pdf-base.service';
import { LaboratoryOrder } from '../../models/laboratory-order.interface';

interface TestRow {
  name: string;
  code: string;
  result: string;
  unit: string;
  reference: string;
  status: 'normal' | 'abnormal' | 'pending';
}

interface SectionGroup {
  sectionName: string;
  tests: TestRow[];
}

@Injectable({ providedIn: 'root' })
export class PdfUnifiedResultsService extends PdfBaseService {

  /** Requerido por PdfBaseService (no se usa directamente) */
  async generatePdf(_data: any): Promise<void> {
    await this.generateForOrder(_data.order, _data.labConfig ?? {});
  }

  /**
   * Genera el PDF de resultados para una orden de laboratorio.
   * @returns Base64 del PDF (sin prefijo data:application/pdf;base64,)
   */
  async generateForOrder(
    order: LaboratoryOrder,
    labConfig: Record<string, string>,
  ): Promise<string> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const labName    = labConfig['lab_name']          || 'LABORATORIO CLÍNICO';
    const labPhone   = labConfig['lab_phone']          || '';
    const labEmail   = labConfig['lab_email']          || '';
    const labAddress = labConfig['lab_address']        || '';
    const footerText = labConfig['pdf_footer_text']    || 'Resultados validados por el laboratorio.';
    const primaryHex = labConfig['pdf_primary_color']  || '#1d4ed8';
    const logoBase64 = labConfig['lab_logo_base64']    || '';

    const primaryRgb = this.hexToRgb(primaryHex);

    // Agrupar pruebas por sección
    const groups = this.groupTestsBySection(order.tests ?? []);

    if (groups.length === 0) {
      // Sin pruebas: generar página en blanco con header e indicación
      this.addPageHeader(doc, order, labName, labPhone, logoBase64, primaryRgb);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('No hay pruebas con resultados en esta orden.', 15, 80, { align: 'left' });
      this.addPageFooter(doc, footerText, 1, 1);
    } else {
      // Una página por sección
      groups.forEach((group, idx) => {
        if (idx > 0) doc.addPage();

        const pageNum = idx + 1;
        const totalPages = groups.length;

        // ── Header compacto ──
        const headerEndY = this.addPageHeader(doc, order, labName, labPhone, logoBase64, primaryRgb);

        // ── Nombre de la sección ──
        const sectionY = headerEndY + 4;
        doc.setFillColor(...primaryRgb);
        doc.rect(15, sectionY, 180, 6, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(group.sectionName.toUpperCase(), 18, sectionY + 4);

        // ── Tabla de resultados ──
        const tableStartY = sectionY + 8;

        autoTable(doc, {
          startY: tableStartY,
          margin: { left: 15, right: 15 },
          head: [['Prueba', 'Cód.', 'Resultado', 'Unidad', 'Referencia', 'Estado']],
          body: group.tests.map(t => [
            t.name,
            t.code,
            t.result,
            t.unit,
            t.reference,
            t.status === 'abnormal' ? 'ANORMAL' : t.status === 'pending' ? 'Pendiente' : 'Normal',
          ]),
          headStyles: {
            fillColor: this.hexToRgb('#374151'),
            textColor: [255, 255, 255],
            fontSize: 7,
            fontStyle: 'bold',
          },
          bodyStyles: { fontSize: 7, textColor: [30, 30, 30] },
          alternateRowStyles: { fillColor: [248, 249, 250] },
          columnStyles: {
            0: { cellWidth: 55 },   // Prueba
            1: { cellWidth: 20 },   // Código
            2: { cellWidth: 30 },   // Resultado
            3: { cellWidth: 20 },   // Unidad
            4: { cellWidth: 35 },   // Referencia
            5: { cellWidth: 20, halign: 'center' }, // Estado
          },
          didDrawCell: (data) => {
            // Colorear celda de estado
            if (data.column.index === 5 && data.section === 'body') {
              const rowIdx = data.row.index;
              const test = group.tests[rowIdx];
              if (test?.status === 'abnormal') {
                doc.setFillColor(254, 226, 226);
                doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
                doc.setTextColor(153, 27, 27);
                doc.setFontSize(7);
                doc.text('ANORMAL', data.cell.x + data.cell.width / 2, data.cell.y + 3.5, { align: 'center' });
              } else if (test?.status === 'normal') {
                doc.setFillColor(220, 252, 231);
                doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
                doc.setTextColor(22, 101, 52);
                doc.setFontSize(7);
                doc.text('Normal', data.cell.x + data.cell.width / 2, data.cell.y + 3.5, { align: 'center' });
              }
            }
          },
        });

        // ── Footer de página ──
        this.addPageFooter(doc, footerText, pageNum, totalPages);
      });
    }

    // Retornar base64 sin el prefijo data URI
    return doc.output('datauristring').split(',')[1];
  }

  /** Descarga el PDF directamente al navegador */
  async downloadForOrder(order: LaboratoryOrder, labConfig: Record<string, string>): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const base64 = await this.generateForOrder(order, labConfig);

    // Regenerar el doc para guardarlo (la forma más directa)
    const labName    = labConfig['lab_name'] || 'Laboratorio';
    const filename = `Resultados-${order.orderNumber ?? order.id}.pdf`;

    // Reconstruir el doc desde base64 y guardarlo
    const bytes = atob(base64);
    const buffer = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) buffer[i] = bytes.charCodeAt(i);
    const blob = new Blob([buffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  // ─── Helpers privados ───────────────────────────────────────────────────

  private addPageHeader(
    doc: jsPDF,
    order: LaboratoryOrder,
    labName: string,
    labPhone: string,
    logoBase64: string,
    primaryRgb: [number, number, number],
  ): number {
    const pageW = doc.internal.pageSize.width;
    let y = 12;

    // Franja de color superior
    doc.setFillColor(...primaryRgb);
    doc.rect(0, 0, pageW, 18, 'F');

    // Logo (si existe)
    if (logoBase64) {
      try {
        const ext = logoBase64.startsWith('data:image/png') ? 'PNG' : 'JPEG';
        doc.addImage(logoBase64, ext, 14, 2, 20, 14);
      } catch (_) {}
    }

    // Nombre del laboratorio
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(labName.toUpperCase(), pageW / 2, 8, { align: 'center' });

    // Teléfono en header
    if (labPhone) {
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(`Tel: ${labPhone}`, pageW / 2, 14, { align: 'center' });
    }

    y = 22;

    // ── Datos de la orden (fila compacta) ──
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');

    const patientName = order.patient
      ? (order.patient.name ?? `${order.patient.firstName ?? ''} ${order.patient.lastName ?? ''}`.trim())
      : 'N/A';

    const orderDate = order.orderDate
      ? new Date(order.orderDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : '—';

    const doctorName = order.doctor
      ? `Dr(a). ${order.doctor.firstName} ${order.doctor.lastName}`
      : '—';

    const docNum = order.patient?.documentNumber ? ` | DNI: ${order.patient.documentNumber}` : '';

    // Línea 1: Orden + Fecha
    doc.text('Orden:', 15, y);
    doc.setFont('helvetica', 'normal');
    doc.text(order.orderNumber ?? order.id, 30, y);

    doc.setFont('helvetica', 'bold');
    doc.text('Fecha:', 90, y);
    doc.setFont('helvetica', 'normal');
    doc.text(orderDate, 103, y);

    doc.setFont('helvetica', 'bold');
    doc.text('Médico:', 140, y);
    doc.setFont('helvetica', 'normal');
    doc.text(doctorName, 155, y);

    y += 5;

    // Línea 2: Paciente
    doc.setFont('helvetica', 'bold');
    doc.text('Paciente:', 15, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`${patientName}${docNum}`, 30, y);

    y += 4;

    // Separador fino
    doc.setDrawColor(...this.hexToRgb('#e5e7eb'));
    doc.setLineWidth(0.3);
    doc.line(15, y, pageW - 15, y);

    return y + 2;
  }

  private addPageFooter(doc: jsPDF, footerText: string, pageNum: number, totalPages: number): void {
    const pageH = doc.internal.pageSize.height;
    const pageW = doc.internal.pageSize.width;
    const y = pageH - 10;

    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);

    // Footer text (left/center) + page number (right)
    const truncated = footerText.length > 100 ? footerText.substring(0, 97) + '...' : footerText;
    doc.text(truncated, 15, y, { maxWidth: 160 });
    doc.text(`Pág. ${pageNum} / ${totalPages}`, pageW - 15, y, { align: 'right' });

    // Línea superior del footer
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(15, y - 3, pageW - 15, y - 3);
  }

  private groupTestsBySection(tests: any[]): SectionGroup[] {
    const map = new Map<string, TestRow[]>();

    for (const t of tests) {
      const sectionName = t.testDefinition?.section?.name ?? 'Sin sección';
      if (!map.has(sectionName)) map.set(sectionName, []);

      map.get(sectionName)!.push(this.buildRow(t));
    }

    const groups: SectionGroup[] = [];
    map.forEach((tests, sectionName) => groups.push({ sectionName, tests }));
    return groups;
  }

  private buildRow(t: any): TestRow {
    const def = t.testDefinition;
    const result = t.unifiedResult ?? t.result ?? null;

    let resultStr = 'Pendiente';
    let status: 'normal' | 'abnormal' | 'pending' = 'pending';

    if (result) {
      if (result.numericValue != null) {
        resultStr = String(parseFloat(result.numericValue));
        status = result.isAbnormal ? 'abnormal' : 'normal';
      } else if (result.responseOption?.label) {
        resultStr = result.responseOption.label;
        status = result.isAbnormal ? 'abnormal' : 'normal';
      } else if (result.textValue) {
        resultStr = result.textValue;
        status = result.isAbnormal ? 'abnormal' : 'normal';
      }
    }

    const refRanges = def?.referenceRanges;
    let reference = '—';
    if (refRanges?.length > 0) {
      const r = refRanges[0];
      if (r.minValue != null && r.maxValue != null) reference = `${r.minValue} - ${r.maxValue}`;
      else if (r.textualRange) reference = r.textualRange;
    }

    return {
      name:      def?.name ?? t.name ?? '—',
      code:      def?.code ?? '—',
      result:    resultStr,
      unit:      def?.unit ?? '—',
      reference,
      status,
    };
  }
}
