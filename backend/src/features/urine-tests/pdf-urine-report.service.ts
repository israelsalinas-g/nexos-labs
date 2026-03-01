import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';
import { UrineTest } from '../../entities/urine-test.entity';
import { LabSettingsService } from '../lab-settings/lab-settings.service';
import { Genres } from '../../common/enums/genres.enums';

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
  isAbnormal?: boolean;
}

@Injectable()
export class PdfUrineReportService {
  private readonly logger = new Logger(PdfUrineReportService.name);

  constructor(
    @InjectRepository(UrineTest)
    private readonly urineTestRepo: Repository<UrineTest>,
    private readonly labSettingsService: LabSettingsService,
  ) {}

  // ─── Public API ─────────────────────────────────────────────────────────────

  async generateUrineTestPdf(id: string): Promise<Buffer> {
    const test = await this.urineTestRepo.findOne({
      where: { id },
      relations: ['patient', 'doctor'],
    });
    if (!test) throw new NotFoundException(`Examen de orina ${id} no encontrado`);

    const labSettings = await this.labSettingsService.getAsMap();
    return this.renderPdf(test, labSettings);
  }

  // ─── PDF rendering ───────────────────────────────────────────────────────────

  private renderPdf(test: UrineTest, labSettings: Record<string, string>): Promise<Buffer> {
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

  private renderPage(doc: any, test: UrineTest, labSettings: Record<string, string>): void {
    const primaryColor = labSettings['pdf_primary_color'] || '#2a7fa5';
    const [pr, pg, pb] = this.hexToRgb(primaryColor);

    // 1. HEADER (logo + info_contacto)
    let curY = this.renderHeader(doc);

    // 2. BARRA AZUL - "GENERAL DE ORINA"
    curY += 6;
    doc.rect(MARGIN, curY, CONTENT_W, 22).fill([pr, pg, pb]);
    doc.font('Helvetica-Bold').fontSize(13).fillColor('white')
      .text('GENERAL DE ORINA', MARGIN, curY + 5, { width: CONTENT_W, align: 'center', lineBreak: false });
    curY += 28;

    // 3. GRID DE PACIENTE
    curY = this.renderPatientGrid(doc, test, curY);
    curY += 10;

    // 4. EXAMEN FÍSICO
    curY = this.renderSubsectionHeader(doc, 'EXAMEN FÍSICO', curY, pr, pg, pb);
    curY = this.renderRows(doc, this.getPhysicalRows(test), curY);
    curY += 8;

    // 5. EXAMEN QUÍMICO
    curY = this.renderSubsectionHeader(doc, 'EXAMEN QUÍMICO', curY, pr, pg, pb);
    curY = this.renderRows(doc, this.getChemicalRows(test), curY);
    curY += 8;

    // 6. EXAMEN MICROSCÓPICO
    curY = this.renderSubsectionHeader(doc, 'EXAMEN MICROSCÓPICO', curY, pr, pg, pb);
    curY = this.renderRows(doc, this.getMicroscopicRows(test), curY);
    curY += 8;

    // 7. OBSERVACIONES (opcional)
    if (test.observations) {
      curY = this.renderSubsectionHeader(doc, 'OBSERVACIONES', curY, pr, pg, pb);
      doc.font('Helvetica').fontSize(8.5).fillColor('#333333')
        .text(test.observations, MARGIN + 5, curY + 3, { width: CONTENT_W - 10 });
    }

    // 8. FOOTER (sellos)
    this.renderFooter(doc, labSettings, FOOTER_LINE_Y, pr, pg, pb);
  }

  // ─── Patient grid ────────────────────────────────────────────────────────────

  private renderPatientGrid(doc: any, test: UrineTest, y: number): number {
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

    const sexLabel =
      patient?.sex === Genres.MALE ? 'MASCULINO'
        : patient?.sex === Genres.FEMALE ? 'FEMENINO'
          : (patient?.sex as string)?.toUpperCase() ?? 'N/A';

    const rightRows = [
      { label: 'Edad:', value: patient?.age != null ? `${patient.age} Años` : 'N/A' },
      { label: 'Sexo:', value: sexLabel },
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

      const color = row.isAbnormal ? '#dc2626' : '#1a1a1a';
      doc.font('Helvetica').fontSize(8.5).fillColor(color)
        .text(row.value || '-', valueX, y + 2, { width: valueW, lineBreak: false });

      y += ROW_H;
    });

    return y;
  }

  // ─── Data builders ───────────────────────────────────────────────────────────

  private getPhysicalRows(test: UrineTest): DataRow[] {
    const t = test as any;
    return [
      { label: 'Volumen', value: t.volume ?? '-' },
      { label: 'Color', value: t.color ?? '-' },
      { label: 'Aspecto', value: t.aspect ?? '-' },
      { label: 'Sedimento', value: t.sediment ?? '-' },
    ];
  }

  private getChemicalRows(test: UrineTest): DataRow[] {
    const t = test as any;
    return [
      { label: 'Densidad', value: t.density ?? '-' },
      { label: 'pH', value: t.ph ?? '-' },
      { label: 'Proteínas', value: t.protein ?? '-', isAbnormal: this.isAbnormal(t.protein) },
      { label: 'Glucosa', value: t.glucose ?? '-', isAbnormal: this.isAbnormal(t.glucose) },
      { label: 'Bilirrubinas', value: t.bilirubin ?? '-', isAbnormal: this.isAbnormal(t.bilirubin) },
      { label: 'Cuerpos Cetónicos', value: t.ketones ?? '-', isAbnormal: this.isAbnormal(t.ketones) },
      { label: 'Sangre Oculta', value: t.occultBlood ?? '-', isAbnormal: this.isAbnormal(t.occultBlood) },
      { label: 'Nitritos', value: t.nitrites ?? '-', isAbnormal: this.isAbnormal(t.nitrites) },
      { label: 'Urobilinógeno', value: t.urobilinogen ?? '-' },
      { label: 'Leucocitos', value: t.leukocytes ?? '-', isAbnormal: this.isAbnormal(t.leukocytes) },
    ];
  }

  private getMicroscopicRows(test: UrineTest): DataRow[] {
    const t = test as any;
    const crystals: any[] = test.crystals || [];
    const cylinders: any[] = test.cylinders || [];

    const crystalsText = crystals.length > 0
      ? crystals.map((c: any) => `${c.type} (${c.quantity})`).join(', ')
      : 'No se observa';
    const cylindersText = cylinders.length > 0
      ? cylinders.map((c: any) => `${c.type} (${c.quantity})`).join(', ')
      : 'No se observa';

    return [
      { label: 'Células Epiteliales', value: t.epithelialCells ?? '-' },
      { label: 'Leucocitos x campo', value: test.leukocytesField ?? '-' },
      { label: 'Eritrocitos x campo', value: test.erythrocytesField ?? '-' },
      { label: 'Bacterias', value: t.bacteria ?? '-' },
      { label: 'Filamentos Mucosos', value: t.mucousFilaments ?? '-' },
      { label: 'Levaduras', value: t.yeasts ?? '-' },
      { label: 'Cristales', value: crystalsText },
      { label: 'Cilindros', value: cylindersText },
      { label: 'Otros', value: test.others ?? 'No se observa' },
    ];
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

    const selloBuffer = this.tryLoadImage('ogyne_sello.png');
    if (selloBuffer) {
      try { doc.image(selloBuffer, rightStampX, stampY, { width: STAMP_W, height: STAMP_H }); } catch { /* skip */ }
    }

    const labName = labSettings['lab_name'] || 'Laboratorio Clínico';
    const labTagline = labSettings['lab_tagline'] || '';
    doc.font('Helvetica-Bold').fontSize(8).fillColor([pr, pg, pb])
      .text(labName.toUpperCase(), rightStampX - 10, stampY + STAMP_H + 5, { width: STAMP_W + 20, align: 'center', lineBreak: false });
    if (labTagline) {
      doc.font('Helvetica').fontSize(7).fillColor('#555555')
        .text(labTagline, rightStampX - 10, stampY + STAMP_H + 16, { width: STAMP_W + 20, align: 'center', lineBreak: false });
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private isAbnormal(value: string | null | undefined): boolean {
    return !!(value && value !== 'Negativo');
  }

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
