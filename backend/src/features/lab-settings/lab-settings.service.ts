import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LabSetting } from '../../entities/lab-setting.entity';
import { ConfigService } from '@nestjs/config';

const DEFAULT_SETTINGS: Omit<LabSetting, 'id' | 'updatedAt'>[] = [
  { key: 'lab_name',          value: 'NEXOS Laboratorio Clínico', label: 'Nombre del laboratorio',      type: 'text',     groupName: 'general' },
  { key: 'lab_tagline',       value: 'Resultados en los que puedes confiar', label: 'Eslogan',          type: 'text',     groupName: 'general' },
  { key: 'lab_logo_base64',   value: null,                         label: 'Logotipo (PNG/JPG ≤ 200 KB)', type: 'image',    groupName: 'general' },
  { key: 'lab_phone',         value: '2234-1234',                  label: 'Teléfono',                    type: 'text',     groupName: 'contact' },
  { key: 'lab_email',         value: 'lab@nexoslabs.hn',           label: 'Correo de contacto',          type: 'text',     groupName: 'contact' },
  { key: 'lab_address',       value: 'Tegucigalpa, Honduras',      label: 'Dirección',                   type: 'textarea', groupName: 'contact' },
  { key: 'lab_city',          value: 'Tegucigalpa, Honduras',      label: 'Ciudad / País',               type: 'text',     groupName: 'contact' },
  { key: 'pdf_primary_color', value: '#1d4ed8',                    label: 'Color primario PDF (hex)',    type: 'color',    groupName: 'pdf'     },
  { key: 'pdf_footer_text',   value: 'Resultados validados por el personal del laboratorio. Para consultas comuníquese con su médico tratante.', label: 'Pie de página PDF', type: 'textarea', groupName: 'pdf' },
  { key: 'smtp_from_name',    value: 'NEXOS Laboratorio Clínico',  label: 'Nombre remitente email',      type: 'text',     groupName: 'contact' },
];

@Injectable()
export class LabSettingsService implements OnModuleInit {
  private readonly logger = new Logger(LabSettingsService.name);

  constructor(
    @InjectRepository(LabSetting)
    private readonly repo: Repository<LabSetting>,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedDefaults();
  }

  private async seedDefaults(): Promise<void> {
    for (const setting of DEFAULT_SETTINGS) {
      const existing = await this.repo.findOne({ where: { key: setting.key } });
      if (!existing) {
        await this.repo.save(this.repo.create(setting));
        this.logger.log(`Setting inicializado: ${setting.key}`);
      }
    }
  }

  async getAll(): Promise<LabSetting[]> {
    return this.repo.find({ order: { groupName: 'ASC', key: 'ASC' } });
  }

  async getAsMap(): Promise<Record<string, string>> {
    const all = await this.repo.find();
    return all.reduce<Record<string, string>>((acc, s) => {
      acc[s.key] = s.value ?? '';
      return acc;
    }, {});
  }

  async getByKey(key: string): Promise<string | null> {
    const setting = await this.repo.findOne({ where: { key } });
    return setting?.value ?? null;
  }

  async bulkUpdate(updates: { key: string; value: string }[]): Promise<LabSetting[]> {
    const results: LabSetting[] = [];
    for (const { key, value } of updates) {
      let setting = await this.repo.findOne({ where: { key } });
      if (!setting) {
        setting = this.repo.create({ key, value });
      } else {
        setting.value = value;
      }
      results.push(await this.repo.save(setting));
    }
    return results;
  }

  /** Retorna si las integraciones externas están configuradas en .env (sin exponer los valores) */
  getIntegrationStatus(): { smtp: boolean; twilio: boolean } {
    return {
      smtp: !!(
        this.config.get('SMTP_HOST') &&
        this.config.get('SMTP_USER') &&
        this.config.get('SMTP_PASS')
      ),
      twilio: !!(
        this.config.get('TWILIO_ACCOUNT_SID') &&
        this.config.get('TWILIO_AUTH_TOKEN')
      ),
    };
  }
}
