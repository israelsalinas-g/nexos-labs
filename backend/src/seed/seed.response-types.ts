import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestResponseType } from '../entities/test-response-type.entity';
import { TestResponseOption } from '../entities/test-response-option.entity';

interface ResponseTypeSeed {
  name: string;
  slug: string;
  inputType: 'numeric' | 'text' | 'enum';
  description?: string;
  isSystem: boolean;
  options?: Array<{ value: string; label?: string; color?: string; displayOrder: number }>;
}

const RESPONSE_TYPES_SEED: ResponseTypeSeed[] = [
  {
    name: 'Numérico',
    slug: 'numeric',
    inputType: 'numeric',
    description: 'Resultado con valor numérico y unidades (ej. mg/dL, UI/L)',
    isSystem: true,
  },
  {
    name: 'Texto libre',
    slug: 'text',
    inputType: 'text',
    description: 'Resultado descriptivo en texto libre',
    isSystem: true,
  },
  {
    name: 'Negativo/Positivo',
    slug: 'positive_negative',
    inputType: 'enum',
    description: 'Resultado cualitativo binario',
    isSystem: true,
    options: [
      { value: 'Negativo', displayOrder: 0, color: '#28a745' },
      { value: 'Positivo', displayOrder: 1, color: '#dc3545' },
    ],
  },
  {
    name: 'Negativo/Positivo (3+)',
    slug: 'positive_negative_3plus',
    inputType: 'enum',
    description: 'Resultado semi-cuantitativo con 3 cruces',
    isSystem: true,
    options: [
      { value: 'Negativo', displayOrder: 0, color: '#28a745' },
      { value: 'Positivo +', displayOrder: 1, color: '#ffc107' },
      { value: 'Positivo ++', displayOrder: 2, color: '#fd7e14' },
      { value: 'Positivo +++', displayOrder: 3, color: '#dc3545' },
    ],
  },
  {
    name: 'Negativo/Positivo (4+)',
    slug: 'positive_negative_4plus',
    inputType: 'enum',
    description: 'Resultado semi-cuantitativo con 4 cruces',
    isSystem: true,
    options: [
      { value: 'Negativo', displayOrder: 0, color: '#28a745' },
      { value: 'Positivo +', displayOrder: 1, color: '#ffc107' },
      { value: 'Positivo ++', displayOrder: 2, color: '#fd7e14' },
      { value: 'Positivo +++', displayOrder: 3, color: '#e85d04' },
      { value: 'Positivo ++++', displayOrder: 4, color: '#dc3545' },
    ],
  },
  {
    name: 'Escasa/Moderada/Abundante',
    slug: 'escasa_moderada_abundante',
    inputType: 'enum',
    description: 'Escala de cantidad sin opción ausente',
    isSystem: true,
    options: [
      { value: 'Escasa cantidad', displayOrder: 0, color: '#ffc107' },
      { value: 'Moderada cantidad', displayOrder: 1, color: '#fd7e14' },
      { value: 'Abundante cantidad', displayOrder: 2, color: '#dc3545' },
    ],
  },
  {
    name: 'Escasa/Moderada/Abundante/Ausente',
    slug: 'escasa_moderada_abundante_ausente',
    inputType: 'enum',
    description: 'Escala de cantidad con opción ausente (No se observa)',
    isSystem: true,
    options: [
      { value: 'No se observa', displayOrder: 0, color: '#28a745' },
      { value: 'Escasa cantidad', displayOrder: 1, color: '#ffc107' },
      { value: 'Moderada cantidad', displayOrder: 2, color: '#fd7e14' },
      { value: 'Abundante cantidad', displayOrder: 3, color: '#dc3545' },
    ],
  },
  {
    name: 'Reactivo/No reactivo',
    slug: 'reactive_non_reactive',
    inputType: 'enum',
    description: 'Resultado cualitativo para pruebas de aglutinación y serología',
    isSystem: true,
    options: [
      { value: 'No reactivo', displayOrder: 0, color: '#28a745' },
      { value: 'Reactivo', displayOrder: 1, color: '#dc3545' },
    ],
  },
  {
    name: 'Detectado/No detectado',
    slug: 'detected_not_detected',
    inputType: 'enum',
    description: 'Resultado cualitativo para pruebas moleculares y antigénicas',
    isSystem: true,
    options: [
      { value: 'No detectado', displayOrder: 0, color: '#28a745' },
      { value: 'Detectado', displayOrder: 1, color: '#dc3545' },
    ],
  },
  {
    name: 'Reactivo (diluciones 1:2 a 1:256)',
    slug: 'reactive_1_256',
    inputType: 'enum',
    description: 'Titulación serológica (VDRL, Rosa de Bengala, etc.)',
    isSystem: true,
    options: [
      { value: 'NO REACTIVO', displayOrder: 0, color: '#28a745' },
      { value: 'REACTIVO 1:2', displayOrder: 1, color: '#ffc107' },
      { value: 'REACTIVO 1:4', displayOrder: 2, color: '#ffc107' },
      { value: 'REACTIVO 1:8', displayOrder: 3, color: '#fd7e14' },
      { value: 'REACTIVO 1:16', displayOrder: 4, color: '#fd7e14' },
      { value: 'REACTIVO 1:32', displayOrder: 5, color: '#e85d04' },
      { value: 'REACTIVO 1:64', displayOrder: 6, color: '#e85d04' },
      { value: 'REACTIVO 1:128', displayOrder: 7, color: '#dc3545' },
      { value: 'REACTIVO 1:256', displayOrder: 8, color: '#dc3545' },
    ],
  },
  {
    name: 'Titulación 200–12800 IU/mL',
    slug: 'negative200_positive12800',
    inputType: 'enum',
    description: 'Titulación serológica en unidades internacionales',
    isSystem: true,
    options: [
      { value: '200 IU/mL', displayOrder: 0, color: '#28a745' },
      { value: 'POSITIVO 400', displayOrder: 1, color: '#ffc107' },
      { value: 'POSITIVO 800', displayOrder: 2, color: '#fd7e14' },
      { value: 'POSITIVO 1600', displayOrder: 3, color: '#e85d04' },
      { value: 'POSITIVO 3200', displayOrder: 4, color: '#dc3545' },
      { value: 'POSITIVO 6400', displayOrder: 5, color: '#dc3545' },
      { value: 'POSITIVO 12.800', displayOrder: 6, color: '#dc3545' },
    ],
  },
  {
    name: 'Titulación 6–3072 IU/mL',
    slug: 'negative6_positive3072',
    inputType: 'enum',
    description: 'Titulación para ASO y anti-DNAsa',
    isSystem: true,
    options: [
      { value: '6 IU/mL', displayOrder: 0, color: '#28a745' },
      { value: 'POSITIVO 12', displayOrder: 1, color: '#ffc107' },
      { value: 'POSITIVO 24', displayOrder: 2, color: '#ffc107' },
      { value: 'POSITIVO 48', displayOrder: 3, color: '#fd7e14' },
      { value: 'POSITIVO 96', displayOrder: 4, color: '#fd7e14' },
      { value: 'POSITIVO 192', displayOrder: 5, color: '#e85d04' },
      { value: 'POSITIVO 384', displayOrder: 6, color: '#e85d04' },
      { value: 'POSITIVO 768', displayOrder: 7, color: '#dc3545' },
      { value: 'POSITIVO 1536', displayOrder: 8, color: '#dc3545' },
      { value: 'POSITIVO 3072', displayOrder: 9, color: '#dc3545' },
    ],
  },
  {
    name: 'Titulación 8–1024 IU/mL',
    slug: 'negative8_positive1024',
    inputType: 'enum',
    description: 'Titulación para Factor Reumatoide',
    isSystem: true,
    options: [
      { value: '8 IU/mL', displayOrder: 0, color: '#28a745' },
      { value: 'POSITIVO 16', displayOrder: 1, color: '#ffc107' },
      { value: 'POSITIVO 32', displayOrder: 2, color: '#fd7e14' },
      { value: 'POSITIVO 64', displayOrder: 3, color: '#e85d04' },
      { value: 'POSITIVO 128', displayOrder: 4, color: '#e85d04' },
      { value: 'POSITIVO 256', displayOrder: 5, color: '#dc3545' },
      { value: 'POSITIVO 512', displayOrder: 6, color: '#dc3545' },
      { value: 'POSITIVO 1.024', displayOrder: 7, color: '#dc3545' },
    ],
  },
  {
    name: 'Colonias Urocultivo (UFC/ml)',
    slug: 'urine_culture_colonies',
    inputType: 'enum',
    description: 'Conteo de colonias para urocultivos',
    isSystem: true,
    options: [
      { value: '50,000 UFC/ml', displayOrder: 0, color: '#ffc107' },
      { value: '100,000 UFC/ml', displayOrder: 1, color: '#fd7e14' },
      { value: '> 100,000 UFC/ml', displayOrder: 2, color: '#dc3545' },
    ],
  },
];

@Injectable()
export class SeedResponseTypes implements OnModuleInit {
  private readonly logger = new Logger(SeedResponseTypes.name);

  constructor(
    @InjectRepository(TestResponseType)
    private readonly responseTypeRepository: Repository<TestResponseType>,
    @InjectRepository(TestResponseOption)
    private readonly responseOptionRepository: Repository<TestResponseOption>,
  ) {}

  async onModuleInit() {
    const shouldSeed = process.env.SEED_INITIAL_DATA === 'true';
    if (!shouldSeed) return;
    await this.seedResponseTypes();
  }

  async seedResponseTypes(): Promise<void> {
    this.logger.log('🌱 Iniciando seed de tipos de respuesta...');

    for (const typeSeed of RESPONSE_TYPES_SEED) {
      const existing = await this.responseTypeRepository.findOne({
        where: { slug: typeSeed.slug },
      });

      if (existing) {
        this.logger.log(`⏭️  Ya existe: ${typeSeed.slug}`);
        continue;
      }

      const responseType = this.responseTypeRepository.create({
        name: typeSeed.name,
        slug: typeSeed.slug,
        inputType: typeSeed.inputType,
        description: typeSeed.description,
        isSystem: typeSeed.isSystem,
      });
      const saved = await this.responseTypeRepository.save(responseType);

      if (typeSeed.options?.length) {
        const options = typeSeed.options.map(opt =>
          this.responseOptionRepository.create({
            value: opt.value,
            label: opt.label ?? opt.value,
            displayOrder: opt.displayOrder,
            color: opt.color,
            responseType: saved,
          })
        );
        await this.responseOptionRepository.save(options);
      }

      this.logger.log(`✅ Creado: ${typeSeed.name} (${typeSeed.slug})`);
    }

    this.logger.log('✨ Seed de tipos de respuesta completado');
  }
}
