import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';
import { StoolTest } from '../../entities/stool-test.entity';
import { LabSettingsService } from '../lab-settings/lab-settings.service';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit');

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 30;
const CONTENT_W = PAGE_W - 2 * MARGIN;
const ROW_H = 16;
const FOOTER_LINE_Y = PAGE_H - 122;

interface DataRow {
  label: string;
  value: string;
}

@Injectable()
export class PdfStoolReportService {
  private readonly logger = new Logger(PdfStoolReportService.name);

  constructor(
    @InjectRepository(StoolTest)
    private readonly stoolTestRepo: Repository<StoolTest>,
    private readonly labSettingsService: LabSettingsService,
  ) { }

  // ─── Public API ─────────────────────────────────────────────────────────────

  async generateStoolTestPdf(id: number): Promise<Buffer> {
    const test = await this.stoolTestRepo.findOne({
      where: { id },
      relations: ['patient', 'doctor'],
    });
    if (!test) throw new NotFoundException(`Examen coprológico ${id} no encontrado`);

    const labSettings = await this.labSettingsService.getAsMap();
    return this.renderPdf(test, labSettings);
  }

  // ─── PDF rendering ───────────────────────────────────────────────────────────

  private renderPdf(test: StoolTest, labSettings: Record<string, string>): Promise<Buffer> {
    const doc = new PDFDocument({ size: 'A4', margin: 0 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    return new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      this.renderPage(doc, test, labSettings);
      doc.end();
    });
  }

  private renderPage(doc: any, test: StoolTest, labSettings: Record<string, string>): void {
    const primaryColor = labSettings['pdf_primary_color'] || '#2a7fa5';
    const [pr, pg, pb] = this.hexToRgb(primaryColor);

    // 1. HEADER (logo + info_contacto)
    let curY = this.renderHeader(doc);

    // 2. BARRA AZUL - "EXAMEN GENERAL DE HECES"
    curY += 6;
    doc.rect(MARGIN, curY, CONTENT_W, 22).fill([pr, pg, pb]);
    doc.font('Helvetica-Bold').fontSize(13).fillColor('white')
      .text('EXAMEN GENERAL DE HECES', MARGIN, curY + 5, { width: CONTENT_W, align: 'center', lineBreak: false });
    curY += 28;

    // 3. GRID DE PACIENTE
    curY = this.renderPatientGrid(doc, test, curY);
    curY += 10;

    // 4. EXAMEN MACROSCÓPICO
    curY = this.renderSubsectionHeader(doc, 'EXAMEN MACROSCÓPICO', curY, pr, pg, pb);
    curY = this.renderRows(doc, this.getMacroscopicRows(test), curY);
    curY += 8;

    // 5. EXAMEN MICROSCÓPICO
    curY = this.renderSubsectionHeader(doc, 'EXAMEN MICROSCÓPICO', curY, pr, pg, pb);
    curY = this.renderRows(doc, this.getMicroscopicRows(test), curY);
    curY += 8;

    // 6. PARÁSITOS OBSERVADOS
    curY = this.renderSubsectionHeader(doc, 'PARÁSITOS OBSERVADOS', curY, pr, pg, pb);
    curY = this.renderRows(doc, this.getParasiteRows(test), curY);
    curY += 8;

    // 7. PROTOZOOS OBSERVADOS
    curY = this.renderSubsectionHeader(doc, 'PROTOZOOS OBSERVADOS', curY, pr, pg, pb);
    curY = this.renderRows(doc, this.getProtozooRows(test), curY);
    curY += 8;

    // 8. OBSERVACIONES (opcional)
    if (test.observations) {
      curY = this.renderSubsectionHeader(doc, 'OBSERVACIONES', curY, pr, pg, pb);
      doc.font('Helvetica').fontSize(8.5).fillColor('#333333')
        .text(test.observations, MARGIN + 5, curY + 3, { width: CONTENT_W - 10 });
    }

    // 9. FOOTER (sellos)
    this.renderFooter(doc, labSettings, FOOTER_LINE_Y, pr, pg, pb);
  }

  // ─── Patient grid ────────────────────────────────────────────────────────────

  private renderPatientGrid(doc: any, test: StoolTest, y: number): number {
    const patient = (test as any).patient;
    const BOX_H = 56;
    const col2X = MARGIN + CONTENT_W / 2 + 5;
    const labelW = 110;

    doc.rect(MARGIN, y, CONTENT_W, BOX_H).strokeColor('#cccccc').lineWidth(0.5).stroke();

    const leftRows = [
      { label: 'Paciente:', value: patient?.name ?? 'N/A' },
      { label: 'DNI:', value: patient?.dni ?? 'N/A' },
      { label: 'Fecha Examen:', value: this.formatDate(test.testDate) },
    ];

    leftRows.forEach((row, i) => {
      const rowY = y + 8 + i * 16;
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#1a1a1a')
        .text(row.label, MARGIN + 6, rowY, { width: labelW, lineBreak: false });
      doc.font('Helvetica').fontSize(8).fillColor('#1a1a1a')
        .text(row.value, MARGIN + 6 + labelW, rowY, { width: CONTENT_W / 2 - labelW - 10, lineBreak: false });
    });

    const rightRows = [
      { label: 'Edad:', value: patient?.age != null ? `${patient.age} Años` : 'N/A' },
      { label: 'Sexo:', value: patient?.sex?.toUpperCase() ?? 'N/A' },
      { label: 'Muestra #:', value: test.sampleNumber ?? 'N/A' },
    ];

    rightRows.forEach((row, i) => {
      const rowY = y + 8 + i * 16;
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#1a1a1a')
        .text(row.label, col2X, rowY, { width: 60, lineBreak: false });
      doc.font('Helvetica').fontSize(8).fillColor('#1a1a1a')
        .text(row.value, col2X + 62, rowY, { width: CONTENT_W / 2 - 70, lineBreak: false });
    });

    return y + BOX_H;
  }

  // ─── Subsection header ───────────────────────────────────────────────────────

  private renderSubsectionHeader(doc: any, name: string, y: number, pr: number, pg: number, pb: number): number {
    doc.font('Helvetica-Bold').fontSize(9.5).fillColor([pr, pg, pb])
      .text(name, MARGIN, y, { characterSpacing: 0.3, lineBreak: false });
    const lineY = y + 13;
    doc.moveTo(MARGIN, lineY).lineTo(MARGIN + CONTENT_W, lineY)
      .strokeColor([pr, pg, pb]).lineWidth(0.8).stroke();
    return lineY + 4;
  }

  // ─── Row rendering ───────────────────────────────────────────────────────────

  private renderRows(doc: any, rows: DataRow[], y: number): number {
    const nameColW = Math.floor(CONTENT_W * 0.42);
    const valueX = MARGIN + nameColW + 6;
    const valueW = CONTENT_W - nameColW - 8;

    rows.forEach((row, i) => {
      if (i % 2 === 1) {
        doc.save();
        doc.rect(MARGIN, y - 1, CONTENT_W, ROW_H).fill('#f4f5f7');
        doc.restore();
      }
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#1a1a1a')
        .text(`${row.label}:`, MARGIN + 5, y + 2, { width: nameColW - 8, lineBreak: false });
      doc.font('Helvetica').fontSize(8.5).fillColor('#1a1a1a')
        .text(row.value || '-', valueX, y + 2, { width: valueW, lineBreak: false });

      y += ROW_H;
    });

    return y;
  }

  // ─── Data builders ───────────────────────────────────────────────────────────

  private getMacroscopicRows(test: StoolTest): DataRow[] {
    return [
      { label: 'Color', value: test.color ?? '-' },
      { label: 'Consistencia', value: test.consistency ?? '-' },
      { label: 'Forma/Cantidad', value: test.shape ?? '-' },
      { label: 'Moco', value: test.mucus ?? '-' },
    ];
  }

  private getMicroscopicRows(test: StoolTest): DataRow[] {
    return [
      { label: 'Leucocitos', value: test.leukocytes ?? '-' },
      { label: 'Eritrocitos', value: test.erythrocytes ?? '-' },
    ];
  }

  private getParasiteRows(test: StoolTest): DataRow[] {
    const parasites = test.parasites || [];
    if (parasites.length === 0) {
      return [{ label: 'Resultado', value: 'No se observan en esta muestra' }];
    }
    return parasites.map((p: any) => ({
      label: p.type,
      value: p.quantity || '-',
    }));
  }

  private getProtozooRows(test: StoolTest): DataRow[] {
    const protozoos = test.protozoos || [];
    if (protozoos.length === 0) {
      return [{ label: 'Resultado', value: 'No se observan en esta muestra' }];
    }
    return protozoos.map((p: any) => ({
      label: p.type,
      value: p.quantity || '-',
    }));
  }

  // ─── Header / Footer ─────────────────────────────────────────────────────────

  private renderHeader(doc: any): number {
    const logoBuffer = this.tryLoadImage('logo_CMO_LABS.png');
    const contactBuffer = this.tryLoadImage('info_contacto.png');
    const startY = 14;

    if (logoBuffer) {
      try { doc.image(logoBuffer, MARGIN, startY, { width: 88, height: 58 }); } catch { /* skip */ }
    }
    if (contactBuffer) {
      try { doc.image(contactBuffer, 283, startY, { width: 282 }); } catch { /* skip */ }
    }

    return startY + 64;
  }

  private renderFooter(
    doc: any,
    labSettings: Record<string, string>,
    lineY: number,
    pr: number,
    pg: number,
    pb: number,
  ): void {
    const STAMP_W = 82;
    const STAMP_H = 82;
    const stampY = lineY + 8;
    const rightStampX = PAGE_W - MARGIN - STAMP_W - 5;

    doc.moveTo(MARGIN, lineY).lineTo(MARGIN + CONTENT_W, lineY)
      .strokeColor('#d1d5db').lineWidth(0.4).stroke();

    const microBuffer = this.tryLoadImage('microbiologo.png');
    if (microBuffer) {
      try { doc.image(microBuffer, MARGIN + 8, stampY, { width: STAMP_W, height: STAMP_H }); } catch { /* skip */ }
    }
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#222222')
      .text('Firma y Sello', MARGIN, stampY + STAMP_H + 5, { width: STAMP_W + 20, align: 'center', lineBreak: false });
    doc.font('Helvetica').fontSize(7).fillColor('#555555')
      .text('Responsable de Laboratorio', MARGIN, stampY + STAMP_H + 16, { width: STAMP_W + 20, align: 'center', lineBreak: false });

    // Resetear cursor antes de la columna derecha para evitar salto de página
    doc.y = stampY;

    const selloBuffer = this.tryLoadImage('ogyne_sello.png');
    if (selloBuffer) {
      try { doc.image(selloBuffer, rightStampX, stampY, { width: STAMP_W, height: STAMP_H }); } catch { /* skip */ }
    }

  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private tryLoadImage(filename: string): Buffer | null {
    try {
      const imgPath = path.join(process.cwd(), 'public', 'assets', 'images', filename);
      return fs.readFileSync(imgPath);
    } catch {
      this.logger.warn(`Imagen no encontrada: ${filename}`);
      return null;
    }
  }

  private formatDate(date: any): string {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('es-HN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return String(date);
    }
  }

  private hexToRgb(hex: string): [number, number, number] {
    const clean = (hex || '#2a7fa5').replace('#', '');
    return [
      parseInt(clean.substring(0, 2), 16) || 42,
      parseInt(clean.substring(2, 4), 16) || 127,
      parseInt(clean.substring(4, 6), 16) || 165,
    ];
  }
}
