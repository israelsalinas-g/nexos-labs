import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion } from '../entities/promotion.entity';
import { TestProfile } from '../entities/test-profile.entity';

interface PromotionSeed {
  name: string;
  description: string;
  price: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  /** Nombres de perfiles a vincular (solo si existen en la BD) */
  profileNames?: string[];
}

const PROMOTIONS_SEED: PromotionSeed[] = [
  {
    name: 'Check-up Anual Completo',
    description:
      'Panel completo de chequeo anual. Incluye hemograma con diferencial, ' +
      'química sanguínea básica (glucosa, urea, creatinina), perfil lipídico ' +
      '(colesterol total, HDL, LDL, triglicéridos), función hepática y urianálisis.',
    price: 199.0,
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
    isActive: true,
    profileNames: ['Hemograma', 'Perfil Lipídico', 'Química Básica'],
  },
  {
    name: 'Promoción Mes de la Madre',
    description:
      'Especial Día de la Madre. Incluye perfil hormonal femenino ' +
      '(TSH, T4 libre, FSH, LH, Prolactina, Estradiol), hemograma y ' +
      'química sanguínea básica. Válido durante mayo.',
    price: 149.0,
    validFrom: '2026-05-01',
    validTo: '2026-05-31',
    isActive: true,
    profileNames: ['Hemograma', 'Perfil Hormonal Femenino'],
  },
  {
    name: 'Promoción Día del Padre',
    description:
      'Especial Día del Padre. Incluye perfil lipídico completo, hemograma, ' +
      'glucosa en ayunas, función renal (urea, creatinina, ácido úrico) y ' +
      'PSA total. Orientado a la salud masculina. Válido durante junio.',
    price: 159.0,
    validFrom: '2026-06-01',
    validTo: '2026-06-30',
    isActive: true,
    profileNames: ['Perfil Lipídico', 'Hemograma', 'Función Renal'],
  },
];

@Injectable()
export class SeedPromotions implements OnModuleInit {
  private readonly logger = new Logger(SeedPromotions.name);

  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepo: Repository<Promotion>,
    @InjectRepository(TestProfile)
    private readonly profileRepo: Repository<TestProfile>,
  ) {}

  async onModuleInit() {
    const shouldSeed = process.env.SEED_INITIAL_DATA === 'true';
    if (!shouldSeed) return;
    await this.seedPromotions();
  }

  async seedPromotions(): Promise<void> {
    this.logger.log('🌱 Iniciando seed de promociones...');

    for (const promo of PROMOTIONS_SEED) {
      const existing = await this.promotionRepo.findOne({
        where: { name: promo.name },
      });

      if (existing) {
        this.logger.log(`⏭️  Ya existe: ${promo.name}`);
        continue;
      }

      // Buscar perfiles por nombre (opcional: si no existen, se crea sin vincular)
      const profiles: TestProfile[] = [];
      for (const profileName of promo.profileNames ?? []) {
        const found = await this.profileRepo.findOne({
          where: { name: profileName },
        });
        if (found) {
          profiles.push(found);
        } else {
          this.logger.warn(`⚠️  Perfil no encontrado: "${profileName}" — se omite`);
        }
      }

      const promotion = this.promotionRepo.create({
        name: promo.name,
        description: promo.description,
        price: promo.price,
        validFrom: promo.validFrom,
        validTo: promo.validTo,
        isActive: promo.isActive,
        profiles,
        tests: [],
      });

      await this.promotionRepo.save(promotion);
      this.logger.log(
        `✅ Creada: ${promo.name} ` +
          `(${profiles.length} perfil(es) vinculado(s))`,
      );
    }

    this.logger.log('✨ Seed de promociones completado');
  }
}
