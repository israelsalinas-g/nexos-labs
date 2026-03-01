import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import * as twilio from 'twilio';
import { LaboratoryOrder } from '../../entities/laboratory-order.entity';
import { OrderTest } from '../../entities/order-test.entity';
import { UnifiedTestResult } from '../../entities/unified-test-result.entity';

export interface SendResultsResponse {
  emailSent: boolean;
  whatsappSent: boolean;
  errors: string[];
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(LaboratoryOrder)
    private readonly orderRepo: Repository<LaboratoryOrder>,
    @InjectRepository(OrderTest)
    private readonly orderTestRepo: Repository<OrderTest>,
    @InjectRepository(UnifiedTestResult)
    private readonly unifiedResultRepo: Repository<UnifiedTestResult>,
  ) {}

  async sendOrderResults(
    orderId: string,
    channels: ('email' | 'whatsapp')[],
    pdfBuffer?: Buffer,
  ): Promise<SendResultsResponse> {
    const response: SendResultsResponse = { emailSent: false, whatsappSent: false, errors: [] };

    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['patient', 'doctor'],
    });
    if (!order) throw new NotFoundException(`Orden ${orderId} no encontrada`);

    const orderTests = await this.orderTestRepo.createQueryBuilder('ot')
      .where('ot.orderId = :orderId', { orderId })
      .leftJoinAndSelect('ot.testDefinition', 'td')
      .leftJoinAndSelect('td.section', 'section')
      .orderBy('section.displayOrder', 'ASC')
      .addOrderBy('td.displayOrder', 'ASC')
      .getMany();

    const results = orderTests.length > 0
      ? await this.unifiedResultRepo.find({
          where: { orderTestId: In(orderTests.map(ot => ot.id)) },
          relations: ['responseOption'],
        })
      : [];

    const resultMap = new Map<number, UnifiedTestResult>();
    results.forEach(r => resultMap.set(r.orderTestId, r));

    const { textBody, htmlBody } = this.buildMessages(order, orderTests, resultMap, !!pdfBuffer);

    const patient = order.patient;
    const pdfFilename = `Resultados-${order.orderNumber ?? orderId}.pdf`;

    if (channels.includes('email')) {
      if (!patient?.email) {
        response.errors.push('El paciente no tiene correo electrónico registrado.');
      } else {
        try {
          await this.sendEmail(
            patient.email,
            `Resultados de Orden ${order.orderNumber}`,
            htmlBody,
            pdfBuffer
              ? [{ filename: pdfFilename, content: pdfBuffer, contentType: 'application/pdf' }]
              : [],
          );
          response.emailSent = true;
          this.logger.log(
            `📧 Email enviado a ${patient.email} para orden ${order.orderNumber}${pdfBuffer ? ' (con PDF adjunto)' : ''}`,
          );
        } catch (err: any) {
          response.errors.push(`Error enviando email: ${err.message}`);
          this.logger.error(`Error enviando email: ${err.message}`);
        }
      }
    }

    if (channels.includes('whatsapp')) {
      if (!patient?.phone) {
        response.errors.push('El paciente no tiene número de teléfono registrado.');
      } else {
        try {
          const toNumber = `whatsapp:+504${patient.phone}`;
          await this.sendWhatsApp(toNumber, textBody);
          response.whatsappSent = true;
          this.logger.log(`📱 WhatsApp enviado a ${toNumber} para orden ${order.orderNumber}`);
        } catch (err: any) {
          response.errors.push(`Error enviando WhatsApp: ${err.message}`);
          this.logger.error(`Error enviando WhatsApp: ${err.message}`);
        }
      }
    }

    return response;
  }

  // ─── Message builders ──────────────────────────────────────────────────────

  private buildMessages(
    order: LaboratoryOrder,
    orderTests: OrderTest[],
    resultMap: Map<number, UnifiedTestResult>,
    hasPdf = false,
  ): { textBody: string; htmlBody: string } {
    const patient = order.patient;
    const dateStr = new Date(order.orderDate).toLocaleDateString('es-HN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
    const doctorName = order.doctor
      ? `Dr/Dra. ${order.doctor.firstName} ${order.doctor.lastName}`
      : 'No especificado';

    // Group by section
    const bySection = new Map<string, { sectionName: string; rows: string[] }>();
    for (const ot of orderTests) {
      const td = ot.testDefinition;
      if (!td) continue;
      const sectionName = (td as any).section?.name ?? 'General';
      if (!bySection.has(sectionName)) bySection.set(sectionName, { sectionName, rows: [] });

      const result = resultMap.get(ot.id);
      const value = this.getResultValue(result);
      const unit = td.unit ? ` ${td.unit}` : '';
      const refRange = (td as any).referenceRange ? ` (Ref: ${(td as any).referenceRange})` : '';
      const abnormalFlag = result?.isAbnormal === true ? ' ⚠️' : (result ? ' ✅' : '');

      bySection.get(sectionName)!.rows.push(
        `• ${td.name}: ${value}${unit}${abnormalFlag}${refRange}`,
      );
    }

    // ── WhatsApp plain text ──
    // Si hay PDF adjunto en el email, enviar mensaje corto de notificación
    let textBody: string;
    if (hasPdf) {
      const labPhone = this.config.get('LAB_PHONE', '2234-1234');
      textBody = `*NEXOS Laboratorio Clínico* — Resultados disponibles\n\n`;
      textBody += `Orden: ${order.orderNumber} | Fecha: ${dateStr}\n`;
      textBody += `Paciente: ${patient?.name ?? 'N/D'}\n\n`;
      textBody += `Sus resultados de laboratorio están listos.\n`;
      textBody += `Se ha enviado un informe detallado en PDF a su correo electrónico.\n\n`;
      textBody += `Para consultas comuníquese al: *${labPhone}*\n`;
      textBody += `_Mensaje generado automáticamente._`;
    } else {
      textBody = `*NEXOS Laboratorio Clínico*\n`;
      textBody += `Orden: ${order.orderNumber} | Fecha: ${dateStr}\n`;
      textBody += `Paciente: ${patient?.name ?? 'N/D'}\n`;
      textBody += `Médico: ${doctorName}\n`;
      textBody += `─────────────────────\n`;

      for (const { sectionName, rows } of bySection.values()) {
        textBody += `\n📋 *${sectionName.toUpperCase()}*\n`;
        textBody += rows.join('\n') + '\n';
      }

      textBody += `\nPara consultas llame al: ${this.config.get('LAB_PHONE', '2234-1234')}\n`;
      textBody += `_Este mensaje es generado automáticamente. No responda a este mensaje._`;
    }

    // ── Email HTML ──
    let resultsRows = '';
    for (const { sectionName, rows } of bySection.values()) {
      resultsRows += `
        <tr><td colspan="4" style="background:#f3f4f6;font-weight:700;padding:8px 12px;font-size:13px;color:#374151;">
          ${sectionName}
        </td></tr>`;
      for (const row of rows) {
        const isAbnormal = row.includes('⚠️');
        const valueColor = isAbnormal ? '#dc2626' : '#166534';
        resultsRows += `
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:8px 12px;font-size:13px;color:#111;">${row.replace(/^• /, '').replace(/⚠️|✅/g, '').split(':')[0]}</td>
          <td style="padding:8px 12px;font-size:13px;font-weight:600;color:${valueColor};">${row.split(':').slice(1).join(':').replace(/⚠️|✅/g, '').trim()}</td>
          <td style="padding:8px 12px;font-size:12px;color:#6b7280;">${isAbnormal ? '⚠️ Anormal' : (row.includes('✅') ? '✅ Normal' : '—')}</td>
        </tr>`;
      }
    }

    const htmlBody = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Resultados de Laboratorio</title></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:24px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:#1d4ed8;padding:24px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:22px;">NEXOS Laboratorio Clínico</h1>
      <p style="color:#bfdbfe;margin:6px 0 0;font-size:14px;">Resultados de Exámenes</p>
    </div>
    <!-- Order info -->
    <div style="padding:20px 24px;border-bottom:1px solid #e5e7eb;">
      <table style="width:100%;font-size:13px;color:#374151;">
        <tr>
          <td style="padding:4px 0;"><strong>Orden:</strong> ${order.orderNumber}</td>
          <td style="padding:4px 0;"><strong>Fecha:</strong> ${dateStr}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;"><strong>Paciente:</strong> ${patient?.name ?? 'N/D'}</td>
          <td style="padding:4px 0;"><strong>Médico:</strong> ${doctorName}</td>
        </tr>
      </table>
    </div>
    <!-- Results table -->
    <div style="padding:16px 24px;">
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="text-align:left;padding:8px 12px;font-size:12px;color:#6b7280;border-bottom:2px solid #e5e7eb;">PRUEBA</th>
            <th style="text-align:left;padding:8px 12px;font-size:12px;color:#6b7280;border-bottom:2px solid #e5e7eb;">RESULTADO</th>
            <th style="text-align:left;padding:8px 12px;font-size:12px;color:#6b7280;border-bottom:2px solid #e5e7eb;">ESTADO</th>
          </tr>
        </thead>
        <tbody>${resultsRows}</tbody>
      </table>
    </div>
    <!-- Footer -->
    <div style="background:#f3f4f6;padding:16px 24px;text-align:center;font-size:12px;color:#6b7280;">
      <p style="margin:0;">Para consultas comuníquese al <strong>${this.config.get('LAB_PHONE', '2234-1234')}</strong></p>
      <p style="margin:4px 0 0;">Este mensaje es generado automáticamente. Por favor no responda a este correo.</p>
    </div>
  </div>
</body>
</html>`;

    return { textBody, htmlBody };
  }

  private getResultValue(result: UnifiedTestResult | undefined): string {
    if (!result) return 'Pendiente';
    if (result.numericValue != null) return String(parseFloat(String(result.numericValue)));
    if (result.responseOption?.label) return result.responseOption.label;
    if (result.textValue) return result.textValue;
    return 'Sin resultado';
  }

  // ─── Sending primitives ────────────────────────────────────────────────────

  private async sendEmail(
    to: string,
    subject: string,
    html: string,
    attachments: { filename: string; content: Buffer; contentType: string }[] = [],
  ): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: this.config.getOrThrow('SMTP_HOST'),
      port: parseInt(this.config.getOrThrow('SMTP_PORT')),
      secure: false,
      auth: {
        user: this.config.getOrThrow('SMTP_USER'),
        pass: this.config.getOrThrow('SMTP_PASS'),
      },
    });

    await transporter.sendMail({
      from: this.config.get('SMTP_FROM', 'NEXOS Laboratorio <lab@nexoslabs.hn>'),
      to,
      subject,
      html,
      attachments,
    });
  }

  private async sendWhatsApp(to: string, body: string): Promise<void> {
    const client = twilio.default(
      this.config.getOrThrow('TWILIO_ACCOUNT_SID'),
      this.config.getOrThrow('TWILIO_AUTH_TOKEN'),
    );

    await client.messages.create({
      from: this.config.getOrThrow('TWILIO_WHATSAPP_FROM'),
      to,
      body,
    });
  }
}
