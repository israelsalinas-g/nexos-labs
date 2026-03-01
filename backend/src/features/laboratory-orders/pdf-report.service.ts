import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';
import { LaboratoryOrder } from '../../entities/laboratory-order.entity';
import { OrderTest } from '../../entities/order-test.entity';
import { UnifiedTestResult } from '../../entities/unified-test-result.entity';
import { LabSettingsService } from '../lab-settings/lab-settings.service';
import { Genres } from '../../common/enums/genres.enums';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit');

// A4 dimensions in points (72 pt/inch)
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 30;
const CONTENT_W = PAGE_W - 2 * MARGIN;

interface TestRow {
  name: string;
  value: string;
  unit: string;
  valueType: 'numeric' | 'option' | 'text' | 'pending';
  isAbnormal: boolean;
  sampleNumber: string;
  subsection: string | null;
}

interface SectionGroup {
  sectionName: string;
  tests: TestRow[];
}

@Injectable()
export class PdfReportService {
  private readonly logger = new Logger(PdfReportService.name);

  constructor(
    @InjectRepository(LaboratoryOrder)
    private readonly orderRepo: Repository<LaboratoryOrder>,
    @InjectRepository(OrderTest)
    private readonly orderTestRepo: Repository<OrderTest>,
    @InjectRepository(UnifiedTestResult)
    private readonly unifiedResultRepo: Repository<UnifiedTestResult>,
    private readonly labSettingsService: LabSettingsService,
  ) {}

  // ─── Public API ─────────────────────────────────────────────────────────────

  async generateOrderPdf(orderId: string): Promise<Buffer> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['patient', 'doctor'],
    });
    if (!order) throw new NotFoundException(`Orden ${orderId} no encontrada`);

    const orderTests = await this.orderTestRepo
      .createQueryBuilder('ot')
      .where('ot.orderId = :orderId', { orderId })
      .leftJoinAndSelect('ot.testDefinition', 'td')
      .leftJoinAndSelect('td.section', 'section')
      .orderBy('section.displayOrder', 'ASC')
      .addOrderBy('td.displayOrder', 'ASC')
      .getMany();

    const results =
      orderTests.length > 0
        ? await this.unifiedResultRepo.find({
            where: { orderTestId: In(orderTests.map((ot) => ot.id)) },
            relations: ['responseOption'],
          })
        : [];

    const resultMap = new Map<number, UnifiedTestResult>();
    results.forEach((r) => resultMap.set(r.orderTestId, r));

    const labSettings = await this.labSettingsService.getAsMap();
    const sectionGroups = this.buildSectionGroups(orderTests, resultMap);

    return this.renderPdf(order, sectionGroups, labSettings);
  }

  // ─── Data builders ───────────────────────────────────────────────────────────

  private buildSectionGroups(
    orderTests: OrderTest[],
    resultMap: Map<number, UnifiedTestResult>,
  ): SectionGroup[] {
    const map = new Map<string, SectionGroup>();

    for (const ot of orderTests) {
      const sectionName = (ot.testDefinition as any)?.section?.name ?? 'Resultados';
      if (!map.has(sectionName)) map.set(sectionName, { sectionName, tests: [] });
      map.get(sectionName)!.tests.push(this.buildTestRow(ot, resultMap.get(ot.id)));
    }

    return Array.from(map.values());
  }

  private buildTestRow(ot: OrderTest, result?: UnifiedTestResult): TestRow {
    const td = ot.testDefinition as any;
    let value = 'Pendiente';
    let valueType: TestRow['valueType'] = 'pending';

    if (result) {
      if (result.numericValue != null) {
        value = String(parseFloat(String(result.numericValue)));
        valueType = 'numeric';
      } else if (result.responseOption?.label) {
        value = result.responseOption.label;
        valueType = 'option';
      } else if (result.textValue) {
        value = result.textValue;
        valueType = 'text';
      }
    }

    return {
      name: td?.name ?? 'Prueba',
      value,
      unit: td?.unit ?? '',
      valueType,
      isAbnormal: result?.isAbnormal === true,
      sampleNumber: ot.sampleNumber ?? '',
      subsection: td?.subsection ?? null,
    };
  }

  // ─── PDF rendering ───────────────────────────────────────────────────────────

  private renderPdf(
    order: LaboratoryOrder,
    sections: SectionGroup[],
    labSettings: Record<string, string>,
  ): Promise<Buffer> {
    const doc = new PDFDocument({ size: 'A4', margin: 0 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    return new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const pageSections =
        sections.length > 0
          ? sections
          : [{ sectionName: 'Sin resultados', tests: [] }];

      pageSections.forEach((section, idx) => {
        if (idx > 0) doc.addPage();
        this.renderPage(doc, section, order, labSettings);
      });

      doc.end();
    });
  }

  private renderPage(
    doc: any,
    section: SectionGroup,
    order: LaboratoryOrder,
    labSettings: Record<string, string>,
  ): void {
    const primaryColor = labSettings['pdf_primary_color'] || '#2a7fa5';
    const [pr, pg, pb] = this.hexToRgb(primaryColor);

    // ── 1. HEADER ─────────────────────────────────────────────────────────────
    const headerEndY = this.renderHeader(doc, labSettings, pr, pg, pb);

    // ── 2. SECTION BAR ────────────────────────────────────────────────────────
    const sectionBarY = headerEndY + 6;
    doc.rect(MARGIN, sectionBarY, CONTENT_W, 22).fill([pr, pg, pb]);
    doc.font('Helvetica-Bold').fontSize(13).fillColor('white').text(
      section.sectionName.toUpperCase(),
      MARGIN,
      sectionBarY + 5,
      { width: CONTENT_W, align: 'center', lineBreak: false },
    );

    // ── 3. PATIENT INFO GRID ──────────────────────────────────────────────────
    const patientY = sectionBarY + 28;
    const firstSample = section.tests[0]?.sampleNumber || 'N/A';
    const patientEndY = this.renderPatientGrid(doc, order, firstSample, patientY, pr, pg, pb);

    // ── 4. TEST RESULTS ───────────────────────────────────────────────────────
    const footerLineY = PAGE_H - 122;
    let curY = patientEndY + 10;

    const subgroups = this.groupBySubsection(section.tests);
    const hasMultipleSubgroups =
      subgroups.size > 1 || (subgroups.size === 1 && !Array.from(subgroups.keys())[0]);

    for (const [subsectionName, tests] of subgroups) {
      if (subsectionName) {
        if (curY + 22 > footerLineY) break;
        curY = this.renderSubsectionHeader(doc, subsectionName, curY, pr, pg, pb);
      }

      let alt = false;
      for (const test of tests) {
        if (curY + 16 > footerLineY) break;
        curY = this.renderTestRow(doc, test, curY, alt);
        alt = !alt;
      }
      curY += 8;
    }

    // ── 5. FOOTER ─────────────────────────────────────────────────────────────
    this.renderFooter(doc, labSettings, footerLineY, pr, pg, pb);
  }

  // ─── Section renderers ────────────────────────────────────────────────────────

  private renderHeader(doc: any, labSettings: Record<string, string>, pr: number, pg: number, pb: number): number {
    const logoBuffer = this.tryLoadImage('logo_CMO_LABS.png');
    const contactBuffer = this.tryLoadImage('info_contacto.png');

    const startY = 18;

    // Logo (left side)
    if (logoBuffer) {
      try { doc.image(logoBuffer, MARGIN, startY, { width: 88, height: 58 }); } catch { /* skip */ }
    }

    // Contact info image (right side)
    if (contactBuffer) {
      try { doc.image(contactBuffer, 283, startY - 8, { width: 282 }); } catch { /* skip */ }
    }

    // Slogan under logo
    const tagline = labSettings['lab_tagline'] || '¡Los resultados en los que puede confiar!';
    doc.font('Helvetica-Oblique').fontSize(7.5).fillColor('#555555')
      .text(tagline, MARGIN, startY + 64, { width: 200, lineBreak: false });

    return startY + 78;
  }

  private renderPatientGrid(
    doc: any,
    order: LaboratoryOrder,
    sampleNumber: string,
    y: number,
    pr: number,
    pg: number,
    pb: number,
  ): number {
    const patient = order.patient as any;
    const BOX_H = 74;
    const col2X = MARGIN + CONTENT_W / 2 + 5;
    const labelW = 105;

    // Box border
    doc.rect(MARGIN, y, CONTENT_W, BOX_H).strokeColor('#cccccc').lineWidth(0.5).stroke();

    // Left column
    const leftRows = [
      { label: 'Paciente:', value: patient?.name ?? 'N/A' },
      { label: 'DNI:', value: patient?.dni ?? 'N/A' },
      { label: 'Fecha de nacimiento:', value: this.formatDate(patient?.birthDate) },
    ];

    leftRows.forEach((row, i) => {
      const rowY = y + 10 + i * 20;
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#1a1a1a')
        .text(row.label, MARGIN + 8, rowY, { width: labelW, lineBreak: false });
      doc.font('Helvetica').fontSize(8.5).fillColor('#1a1a1a')
        .text(row.value, MARGIN + 8 + labelW, rowY, { width: CONTENT_W / 2 - labelW - 10, lineBreak: false });
    });

    // Right column
    const sexLabel =
      patient?.sex === Genres.MALE
        ? 'MASCULINO'
        : patient?.sex === Genres.FEMALE
          ? 'FEMENINO'
          : (patient?.sex as string)?.toUpperCase() ?? 'N/A';

    const ageDisplay = patient?.age != null ? `${patient.age} Años` : 'N/A';

    const rightRows = [
      { label: 'Edad:', value: ageDisplay },
      { label: 'Sexo:', value: sexLabel },
      { label: 'Muestra #:', value: sampleNumber },
    ];

    rightRows.forEach((row, i) => {
      const rowY = y + 10 + i * 20;
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#1a1a1a')
        .text(row.label, col2X, rowY, { width: 60, lineBreak: false });
      doc.font('Helvetica').fontSize(8.5).fillColor('#1a1a1a')
        .text(row.value, col2X + 62, rowY, { width: CONTENT_W / 2 - 70, lineBreak: false });
    });

    return y + BOX_H;
  }

  private renderSubsectionHeader(
    doc: any,
    name: string,
    y: number,
    pr: number,
    pg: number,
    pb: number,
  ): number {
    doc.font('Helvetica-Bold').fontSize(9.5).fillColor([pr, pg, pb])
      .text(name.toUpperCase(), MARGIN, y, { characterSpacing: 0.3, lineBreak: false });
    const lineY = y + 13;
    doc.moveTo(MARGIN, lineY).lineTo(MARGIN + CONTENT_W, lineY)
      .strokeColor([pr, pg, pb]).lineWidth(0.8).stroke();
    return lineY + 7;
  }

  private renderTestRow(doc: any, test: TestRow, y: number, alternate: boolean): number {
    const ROW_H = 16;
    const nameColW = Math.floor(CONTENT_W * 0.42);
    const valueX = MARGIN + nameColW + 6;
    const valueW = CONTENT_W - nameColW - 8;

    if (alternate) {
      doc.save();
      doc.rect(MARGIN, y - 1, CONTENT_W, ROW_H).fill('#f4f5f7');
      doc.restore();
    }

    // Test name (bold)
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#1a1a1a')
      .text(`${test.name}:`, MARGIN + 5, y + 2, { width: nameColW - 8, lineBreak: false });

    // Value (colored)
    let valueColor = '#1a1a1a';
    if (test.isAbnormal) {
      valueColor = '#dc2626';
    } else if (test.valueType === 'option') {
      valueColor = '#2563eb';
    } else if (test.valueType === 'text') {
      valueColor = '#4b5563';
    } else if (test.valueType === 'pending') {
      valueColor = '#9ca3af';
    }

    const displayValue = test.unit ? `${test.value} ${test.unit}` : test.value;
    const isItalic =
      test.valueType === 'text' &&
      (test.value.toLowerCase().includes('no se observa') ||
        test.value.toLowerCase().includes('negativo') === false);

    doc.font(isItalic ? 'Helvetica-Oblique' : 'Helvetica')
      .fontSize(8.5)
      .fillColor(valueColor)
      .text(displayValue, valueX, y + 2, { width: valueW, lineBreak: false });

    return y + ROW_H;
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

    // Divider line
    doc.moveTo(MARGIN, lineY).lineTo(MARGIN + CONTENT_W, lineY)
      .strokeColor('#d1d5db').lineWidth(0.4).stroke();

    // Left stamp: microbiólogo
    const microBuffer = this.tryLoadImage('microbiologo.png');
    if (microBuffer) {
      try {
        doc.image(microBuffer, MARGIN + 8, stampY, { width: STAMP_W, height: STAMP_H });
      } catch { /* skip */ }
    }
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#222222')
      .text('Firma y Sello', MARGIN, stampY + STAMP_H + 5, { width: STAMP_W + 20, align: 'center', lineBreak: false });
    doc.font('Helvetica').fontSize(7).fillColor('#555555')
      .text('Responsable de Laboratorio', MARGIN, stampY + STAMP_H + 16, { width: STAMP_W + 20, align: 'center', lineBreak: false });

    // Right stamp: lab seal
    const selloBuffer = this.tryLoadImage('ogyne_sello.png');
    if (selloBuffer) {
      try {
        doc.image(selloBuffer, rightStampX, stampY, { width: STAMP_W, height: STAMP_H });
      } catch { /* skip */ }
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

  private groupBySubsection(tests: TestRow[]): Map<string, TestRow[]> {
    const map = new Map<string, TestRow[]>();
    for (const test of tests) {
      const key = test.subsection || '';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(test);
    }
    return map;
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
      const d = new Date(date);
      return d.toLocaleDateString('es-HN', { day: '2-digit', month: '2-digit', year: 'numeric' });
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
