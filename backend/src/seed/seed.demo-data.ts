import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestSection } from '../entities/test-section.entity';
import { TestDefinition } from '../entities/test-definition.entity';
import { TestProfile } from '../entities/test-profile.entity';
import { TestReferenceRange, RangeGender } from '../entities/test-reference-range.entity';
import { Doctor } from '../entities/doctor.entity';
import { Patient } from '../entities/patient.entity';
import { TestResultType } from '../common/enums/test-result-type.enums';
import { Genres } from '../common/enums/genres.enums';
import { BloodType } from '../common/enums/blood-type.enums';

@Injectable()
export class SeedDemoData implements OnModuleInit {
  private readonly logger = new Logger(SeedDemoData.name);

  constructor(
    @InjectRepository(TestSection)
    private sectionRepo: Repository<TestSection>,
    @InjectRepository(TestDefinition)
    private testRepo: Repository<TestDefinition>,
    @InjectRepository(TestProfile)
    private profileRepo: Repository<TestProfile>,
    @InjectRepository(TestReferenceRange)
    private rangeRepo: Repository<TestReferenceRange>,
    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,
    @InjectRepository(Patient)
    private patientRepo: Repository<Patient>,
  ) {}

  async onModuleInit() {
    const shouldSeed = process.env.SEED_INITIAL_DATA === 'true';
    if (!shouldSeed) return;

    this.logger.log('🌱 Iniciando seed de datos demo...');
    const sections = await this.seedSections();
    const tests = await this.seedTests(sections);
    await this.seedReferenceRanges(tests);
    await this.seedProfiles(sections, tests);
    await this.seedDoctors();
    await this.seedPatients();
    this.logger.log('✨ Seed de datos demo completado');
  }

  // ─── Secciones ───────────────────────────────────────────────────────────────

  private async seedSections(): Promise<Record<string, TestSection>> {
    this.logger.log('📂 Creando secciones...');

    const data = [
      { name: 'Química Sanguínea', code: 'QS', color: '#2196F3', displayOrder: 1,
        description: 'Exámenes bioquímicos de sangre: glucosa, lípidos, función renal y hepática.' },
      { name: 'Hematología', code: 'HEM', color: '#F44336', displayOrder: 2,
        description: 'Análisis de células sanguíneas: hemograma, coagulación y VSG.' },
      { name: 'Serología', code: 'SER', color: '#9C27B0', displayOrder: 3,
        description: 'Pruebas de anticuerpos e infecciones: VIH, VDRL, hepatitis, toxoplasma.' },
      { name: 'Uroanálisis', code: 'URO', color: '#FF9800', displayOrder: 4,
        description: 'Exámenes de orina: EGO, urocultivo, proteínas y glucosa en orina.' },
      { name: 'Microbiología', code: 'MIC', color: '#4CAF50', displayOrder: 5,
        description: 'Cultivos y antibiogramas de diversas muestras biológicas.' },
      { name: 'Hormonas', code: 'HOR', color: '#E91E63', displayOrder: 6,
        description: 'Dosificación hormonal: tiroides, insulina, testosterona, PSA.' },
      { name: 'Coagulación', code: 'COA', color: '#FF5722', displayOrder: 7,
        description: 'Tiempos de coagulación: TP, TTP, INR.' },
    ];

    const result: Record<string, TestSection> = {};
    for (const d of data) {
      let section = await this.sectionRepo.findOne({ where: { code: d.code } });
      if (!section) {
        section = await this.sectionRepo.save(this.sectionRepo.create(d));
        this.logger.log(`  ✅ Sección: ${d.name}`);
      } else {
        this.logger.log(`  ⏭️  Sección ya existe: ${d.name}`);
      }
      result[d.code] = section;
    }
    return result;
  }

  // ─── Pruebas ─────────────────────────────────────────────────────────────────

  private async seedTests(sections: Record<string, TestSection>): Promise<Record<string, TestDefinition>> {
    this.logger.log('🔬 Creando pruebas...');

    const QS = sections['QS'];
    const HEM = sections['HEM'];
    const SER = sections['SER'];
    const URO = sections['URO'];
    const MIC = sections['MIC'];
    const HOR = sections['HOR'];
    const COA = sections['COA'];

    const NUM = TestResultType.NUMERIC;
    const TXT = TestResultType.TEXT;
    const POSN = TestResultType.POSITIVE_NEGATIVE;
    const REAC = TestResultType.REACTIVE_NON_REACTIVE;
    const EMA = TestResultType.ESCASA_MODERADA_ABUNDANTE;
    const EMAA = TestResultType.ESCASA_MODERADA_ABUNDANTE_AUSENTE;

    const definitions = [
      // ── Química Sanguínea ──
      { section: QS, code: 'GLUC', name: 'Glucosa en Ayunas', resultType: NUM, unit: 'mg/dL',
        price: 120, processingTime: 2, displayOrder: 1, sampleType: 'Suero',
        description: 'Determinación de glucosa sérica en muestra de ayuno de 8 horas.' },
      { section: QS, code: 'CTOT', name: 'Colesterol Total', resultType: NUM, unit: 'mg/dL',
        price: 100, processingTime: 2, displayOrder: 2, sampleType: 'Suero' },
      { section: QS, code: 'TRIG', name: 'Triglicéridos', resultType: NUM, unit: 'mg/dL',
        price: 100, processingTime: 2, displayOrder: 3, sampleType: 'Suero' },
      { section: QS, code: 'HDL', name: 'HDL Colesterol', resultType: NUM, unit: 'mg/dL',
        price: 110, processingTime: 2, displayOrder: 4, sampleType: 'Suero' },
      { section: QS, code: 'LDL', name: 'LDL Colesterol', resultType: NUM, unit: 'mg/dL',
        price: 110, processingTime: 2, displayOrder: 5, sampleType: 'Suero' },
      { section: QS, code: 'CREAT', name: 'Creatinina', resultType: NUM, unit: 'mg/dL',
        price: 80, processingTime: 2, displayOrder: 6, sampleType: 'Suero',
        description: 'Medición de creatinina sérica para evaluación de función renal.' },
      { section: QS, code: 'BUN', name: 'Nitrógeno Ureico (BUN)', resultType: NUM, unit: 'mg/dL',
        price: 80, processingTime: 2, displayOrder: 7, sampleType: 'Suero' },
      { section: QS, code: 'URIC', name: 'Ácido Úrico', resultType: NUM, unit: 'mg/dL',
        price: 80, processingTime: 2, displayOrder: 8, sampleType: 'Suero' },
      { section: QS, code: 'TGO', name: 'TGO (AST)', resultType: NUM, unit: 'U/L',
        price: 90, processingTime: 2, displayOrder: 9, sampleType: 'Suero' },
      { section: QS, code: 'TGP', name: 'TGP (ALT)', resultType: NUM, unit: 'U/L',
        price: 90, processingTime: 2, displayOrder: 10, sampleType: 'Suero' },
      { section: QS, code: 'BILT', name: 'Bilirrubina Total', resultType: NUM, unit: 'mg/dL',
        price: 80, processingTime: 2, displayOrder: 11, sampleType: 'Suero' },
      { section: QS, code: 'BILD', name: 'Bilirrubina Directa', resultType: NUM, unit: 'mg/dL',
        price: 80, processingTime: 2, displayOrder: 12, sampleType: 'Suero' },
      { section: QS, code: 'PROT', name: 'Proteínas Totales', resultType: NUM, unit: 'g/dL',
        price: 80, processingTime: 2, displayOrder: 13, sampleType: 'Suero' },
      { section: QS, code: 'FALC', name: 'Fosfatasa Alcalina', resultType: NUM, unit: 'U/L',
        price: 90, processingTime: 2, displayOrder: 14, sampleType: 'Suero' },
      { section: QS, code: 'ALB', name: 'Albúmina', resultType: NUM, unit: 'g/dL',
        price: 80, processingTime: 2, displayOrder: 15, sampleType: 'Suero' },

      // ── Hematología ──
      { section: HEM, code: 'HGB', name: 'Hemoglobina', resultType: NUM, unit: 'g/dL',
        price: 80, processingTime: 1, displayOrder: 1, sampleType: 'Sangre EDTA' },
      { section: HEM, code: 'HCT', name: 'Hematocrito', resultType: NUM, unit: '%',
        price: 80, processingTime: 1, displayOrder: 2, sampleType: 'Sangre EDTA' },
      { section: HEM, code: 'GR', name: 'Glóbulos Rojos (Eritrocitos)', resultType: NUM, unit: 'x10⁶/µL',
        price: 80, processingTime: 1, displayOrder: 3, sampleType: 'Sangre EDTA' },
      { section: HEM, code: 'GB', name: 'Glóbulos Blancos (Leucocitos)', resultType: NUM, unit: 'x10³/µL',
        price: 80, processingTime: 1, displayOrder: 4, sampleType: 'Sangre EDTA' },
      { section: HEM, code: 'PLAQ', name: 'Plaquetas', resultType: NUM, unit: 'x10³/µL',
        price: 80, processingTime: 1, displayOrder: 5, sampleType: 'Sangre EDTA' },
      { section: HEM, code: 'VSG', name: 'Velocidad de Sedimentación Globular', resultType: NUM, unit: 'mm/h',
        price: 80, processingTime: 2, displayOrder: 6, sampleType: 'Sangre EDTA' },
      { section: HEM, code: 'DIFF', name: 'Diferencial de Leucocitos', resultType: TXT, unit: '%',
        price: 100, processingTime: 2, displayOrder: 7, sampleType: 'Sangre EDTA',
        description: 'Conteo diferencial: neutrófilos, linfocitos, monocitos, eosinófilos, basófilos.' },

      // ── Serología ──
      { section: SER, code: 'VDRL', name: 'VDRL / RPR (Sífilis)', resultType: REAC,
        price: 80, processingTime: 3, displayOrder: 1, sampleType: 'Suero' },
      { section: SER, code: 'VIH', name: 'VIH (Anticuerpos 1 y 2)', resultType: REAC,
        price: 200, processingTime: 4, displayOrder: 2, sampleType: 'Suero',
        description: 'Tamizaje de anticuerpos anti-VIH-1/2. Prueba de cuarta generación.' },
      { section: SER, code: 'HBS', name: 'Hepatitis B (HBsAg)', resultType: REAC,
        price: 120, processingTime: 3, displayOrder: 3, sampleType: 'Suero' },
      { section: SER, code: 'HCV', name: 'Hepatitis C (Anti-HCV)', resultType: REAC,
        price: 120, processingTime: 3, displayOrder: 4, sampleType: 'Suero' },
      { section: SER, code: 'TOXIG', name: 'Toxoplasma IgG', resultType: REAC,
        price: 120, processingTime: 4, displayOrder: 5, sampleType: 'Suero' },
      { section: SER, code: 'TOXIM', name: 'Toxoplasma IgM', resultType: REAC,
        price: 120, processingTime: 4, displayOrder: 6, sampleType: 'Suero' },
      { section: SER, code: 'FR', name: 'Factor Reumatoide', resultType: REAC,
        price: 80, processingTime: 3, displayOrder: 7, sampleType: 'Suero' },
      { section: SER, code: 'PCR', name: 'Proteína C Reactiva', resultType: NUM, unit: 'mg/dL',
        price: 90, processingTime: 3, displayOrder: 8, sampleType: 'Suero' },

      // ── Uroanálisis ──
      { section: URO, code: 'EGO', name: 'Examen General de Orina', resultType: TXT,
        price: 80, processingTime: 1, displayOrder: 1, sampleType: 'Orina fresca',
        description: 'Análisis físico, químico y microscópico de orina.' },
      { section: URO, code: 'PROTU', name: 'Proteínas en Orina (Cualitativo)', resultType: EMAA,
        price: 80, processingTime: 1, displayOrder: 2, sampleType: 'Orina fresca' },
      { section: URO, code: 'GLUCU', name: 'Glucosa en Orina (Cualitativo)', resultType: POSN,
        price: 80, processingTime: 1, displayOrder: 3, sampleType: 'Orina fresca' },
      { section: URO, code: 'MICRU', name: 'Microalbuminuria', resultType: NUM, unit: 'mg/g creatinina',
        price: 150, processingTime: 2, displayOrder: 4, sampleType: 'Orina 24h' },

      // ── Microbiología ──
      { section: MIC, code: 'UROC', name: 'Urocultivo + Antibiograma', resultType: TXT,
        price: 180, processingTime: 48, displayOrder: 1, sampleType: 'Orina de chorro medio',
        description: 'Cultivo de orina con identificación de microorganismo y sensibilidad antibiótica.' },
      { section: MIC, code: 'COPR', name: 'Coprocultivo + Antibiograma', resultType: TXT,
        price: 200, processingTime: 72, displayOrder: 2, sampleType: 'Heces frescas' },
      { section: MIC, code: 'CULTH', name: 'Cultivo de Herida + Antibiograma', resultType: TXT,
        price: 180, processingTime: 72, displayOrder: 3, sampleType: 'Hisopado de herida' },
      { section: MIC, code: 'HEMOC', name: 'Hemocultivo', resultType: TXT,
        price: 350, processingTime: 120, displayOrder: 4, sampleType: 'Sangre venosa',
        description: 'Detección de bacteriemia. Incubación hasta 5 días.' },

      // ── Hormonas ──
      { section: HOR, code: 'TSH', name: 'TSH (Hormona Estimulante de Tiroides)', resultType: NUM, unit: 'µUI/mL',
        price: 200, processingTime: 4, displayOrder: 1, sampleType: 'Suero' },
      { section: HOR, code: 'T4L', name: 'T4 Libre', resultType: NUM, unit: 'ng/dL',
        price: 200, processingTime: 4, displayOrder: 2, sampleType: 'Suero' },
      { section: HOR, code: 'T3L', name: 'T3 Libre', resultType: NUM, unit: 'pg/mL',
        price: 200, processingTime: 4, displayOrder: 3, sampleType: 'Suero' },
      { section: HOR, code: 'INS', name: 'Insulina en Ayunas', resultType: NUM, unit: 'µUI/mL',
        price: 180, processingTime: 4, displayOrder: 4, sampleType: 'Suero' },
      { section: HOR, code: 'PSA', name: 'PSA (Antígeno Prostático Específico)', resultType: NUM, unit: 'ng/mL',
        price: 250, processingTime: 4, displayOrder: 5, sampleType: 'Suero' },
      { section: HOR, code: 'TESTO', name: 'Testosterona Total', resultType: NUM, unit: 'ng/dL',
        price: 220, processingTime: 4, displayOrder: 6, sampleType: 'Suero' },
      { section: HOR, code: 'FSH', name: 'FSH (Hormona Foliculoestimulante)', resultType: NUM, unit: 'mUI/mL',
        price: 200, processingTime: 4, displayOrder: 7, sampleType: 'Suero' },
      { section: HOR, code: 'LH', name: 'LH (Hormona Luteinizante)', resultType: NUM, unit: 'mUI/mL',
        price: 200, processingTime: 4, displayOrder: 8, sampleType: 'Suero' },

      // ── Coagulación ──
      { section: COA, code: 'TP', name: 'Tiempo de Protrombina (TP)', resultType: NUM, unit: 'segundos',
        price: 100, processingTime: 2, displayOrder: 1, sampleType: 'Plasma citratado' },
      { section: COA, code: 'TTP', name: 'Tiempo Parcial de Tromboplastina (TTP)', resultType: NUM, unit: 'segundos',
        price: 100, processingTime: 2, displayOrder: 2, sampleType: 'Plasma citratado' },
      { section: COA, code: 'INR', name: 'INR', resultType: NUM, unit: 'ratio',
        price: 100, processingTime: 2, displayOrder: 3, sampleType: 'Plasma citratado' },
    ];

    const result: Record<string, TestDefinition> = {};
    for (const d of definitions) {
      let test = await this.testRepo.findOne({ where: { code: d.code } });
      if (!test) {
        test = await this.testRepo.save(this.testRepo.create(d as any));
        this.logger.log(`  ✅ Prueba: ${d.name}`);
      } else {
        this.logger.log(`  ⏭️  Prueba ya existe: ${d.name}`);
      }
      result[d.code] = test;
    }
    return result;
  }

  // ─── Rangos de Referencia ─────────────────────────────────────────────────

  private async seedReferenceRanges(tests: Record<string, TestDefinition>): Promise<void> {
    this.logger.log('📏 Creando rangos de referencia...');

    const ranges: Partial<TestReferenceRange>[] = [
      // Glucosa en Ayunas
      { testDefinition: tests['GLUC'], gender: RangeGender.ANY, ageMinMonths: 0, ageMaxMonths: 215,
        minValue: 60, maxValue: 100, unit: 'mg/dL', interpretation: 'Normal (niños)' },
      { testDefinition: tests['GLUC'], gender: RangeGender.ANY, ageMinMonths: 216, ageMaxMonths: null,
        minValue: 70, maxValue: 100, unit: 'mg/dL', interpretation: 'Normal (adultos)' },

      // Colesterol Total
      { testDefinition: tests['CTOT'], gender: RangeGender.ANY, ageMinMonths: 216, ageMaxMonths: null,
        maxValue: 200, unit: 'mg/dL', interpretation: 'Deseable', textualRange: '< 200 mg/dL' },

      // Triglicéridos
      { testDefinition: tests['TRIG'], gender: RangeGender.ANY, ageMinMonths: 216, ageMaxMonths: null,
        maxValue: 150, unit: 'mg/dL', interpretation: 'Normal', textualRange: '< 150 mg/dL' },

      // HDL Colesterol
      { testDefinition: tests['HDL'], gender: RangeGender.MALE, ageMinMonths: 216, ageMaxMonths: null,
        minValue: 40, unit: 'mg/dL', interpretation: 'Deseable', textualRange: '≥ 40 mg/dL' },
      { testDefinition: tests['HDL'], gender: RangeGender.FEMALE, ageMinMonths: 216, ageMaxMonths: null,
        minValue: 50, unit: 'mg/dL', interpretation: 'Deseable', textualRange: '≥ 50 mg/dL' },

      // LDL Colesterol
      { testDefinition: tests['LDL'], gender: RangeGender.ANY, ageMinMonths: 216, ageMaxMonths: null,
        maxValue: 130, unit: 'mg/dL', interpretation: 'Óptimo a límite', textualRange: '< 130 mg/dL' },

      // Creatinina
      { testDefinition: tests['CREAT'], gender: RangeGender.MALE, ageMinMonths: 216, ageMaxMonths: null,
        minValue: 0.7, maxValue: 1.3, unit: 'mg/dL', interpretation: 'Normal' },
      { testDefinition: tests['CREAT'], gender: RangeGender.FEMALE, ageMinMonths: 216, ageMaxMonths: null,
        minValue: 0.5, maxValue: 1.1, unit: 'mg/dL', interpretation: 'Normal' },

      // BUN
      { testDefinition: tests['BUN'], gender: RangeGender.ANY, ageMinMonths: 216, ageMaxMonths: null,
        minValue: 7, maxValue: 20, unit: 'mg/dL', interpretation: 'Normal' },

      // Ácido Úrico
      { testDefinition: tests['URIC'], gender: RangeGender.MALE, ageMinMonths: 216, ageMaxMonths: null,
        minValue: 3.5, maxValue: 7.2, unit: 'mg/dL', interpretation: 'Normal' },
      { testDefinition: tests['URIC'], gender: RangeGender.FEMALE, ageMinMonths: 216, ageMaxMonths: null,
        minValue: 2.6, maxValue: 6.0, unit: 'mg/dL', interpretation: 'Normal' },

      // TGO (AST)
      { testDefinition: tests['TGO'], gender: RangeGender.MALE, ageMinMonths: 216, ageMaxMonths: null,
        minValue: 10, maxValue: 40, unit: 'U/L', interpretation: 'Normal' },
      { testDefinition: tests['TGO'], gender: RangeGender.FEMALE, ageMinMonths: 216, ageMaxMonths: null,
        minValue: 10, maxValue: 35, unit: 'U/L', interpretation: 'Normal' },

      // TGP (ALT)
      { testDefinition: tests['TGP'], gender: RangeGender.MALE, ageMinMonths: 216, ageMaxMonths: null,
        minValue: 7, maxValue: 56, unit: 'U/L', interpretation: 'Normal' },
      { testDefinition: tests['TGP'], gender: RangeGender.FEMALE, ageMinMonths: 216, ageMaxMonths: null,
        minValue: 7, maxValue: 45, unit: 'U/L', interpretation: 'Normal' },

      // Bilirrubina Total
      { testDefinition: tests['BILT'], gender: RangeGender.ANY, ageMinMonths: 216, ageMaxMonths: null,
        minValue: 0.2, maxValue: 1.2, unit: 'mg/dL', interpretation: 'Normal' },

      // Proteínas Totales
      { testDefinition: tests['PROT'], gender: RangeGender.ANY, ageMinMonths: 216, ageMaxMonths: null,
        minValue: 6.4, maxValue: 8.3, unit: 'g/dL', interpretation: 'Normal' },

      // Hemoglobina
      { testDefinition: tests['HGB'], gender: RangeGender.MALE, ageMinMonths: 216, ageMaxMonths: null,
        minValue: 13.5, maxValue: 17.5, unit: 'g/dL', interpretation: 'Normal' },
      { testDefinition: tests['HGB'], gender: RangeGender.FEMALE, ageMinMonths: 216, ageMaxMonths: null,
        minValue: 12.0, maxValue: 16.0, unit: 'g/dL', interpretation: 'Normal' },
      { testDefinition: tests['HGB'], gender: RangeGender.ANY, ageMinMonths: 0, ageMaxMonths: 215,
        minValue: 11.0, maxValue: 16.0, unit: 'g/dL', interpretation: 'Normal (menores de 18 años)' },

      // Hematocrito
      { testDefinition: tests['HCT'], gender: RangeGender.MALE, ageMinMonths: 216, ageMaxMonths: null,
        minValue: 41, maxValue: 53, unit: '%', interpretation: 'Normal' },
      { testDefinition: tests['HCT'], gender: RangeGender.FEMALE, ageMinMonths: 216, ageMaxMonths: null,
        minValue: 36, maxValue: 46, unit: '%', interpretation: 'Normal' },

      // Glóbulos Blancos
      { testDefinition: tests['GB'], gender: RangeGender.ANY, ageMinMonths: 216, ageMaxMonths: null,
        minValue: 4.5, maxValue: 11.0, unit: 'x10³/µL', interpretation: 'Normal' },

      // Plaquetas
      { testDefinition: tests['PLAQ'], gender: RangeGender.ANY, ageMinMonths: 0, ageMaxMonths: null,
        minValue: 150, maxValue: 400, unit: 'x10³/µL', interpretation: 'Normal' },

      // TSH
      { testDefinition: tests['TSH'], gender: RangeGender.ANY, ageMinMonths: 216, ageMaxMonths: null,
        minValue: 0.4, maxValue: 4.0, unit: 'µUI/mL', interpretation: 'Normal' },

      // T4 Libre
      { testDefinition: tests['T4L'], gender: RangeGender.ANY, ageMinMonths: 216, ageMaxMonths: null,
        minValue: 0.8, maxValue: 1.8, unit: 'ng/dL', interpretation: 'Normal' },

      // Insulina en Ayunas
      { testDefinition: tests['INS'], gender: RangeGender.ANY, ageMinMonths: 216, ageMaxMonths: null,
        minValue: 2.6, maxValue: 24.9, unit: 'µUI/mL', interpretation: 'Normal en ayuno' },

      // PSA — por edad en hombres
      { testDefinition: tests['PSA'], gender: RangeGender.MALE, ageMinMonths: 0, ageMaxMonths: 479,
        maxValue: 2.0, unit: 'ng/mL', interpretation: 'Normal', textualRange: '< 2.0 ng/mL (< 40 años)' },
      { testDefinition: tests['PSA'], gender: RangeGender.MALE, ageMinMonths: 480, ageMaxMonths: 719,
        maxValue: 2.5, unit: 'ng/mL', interpretation: 'Normal', textualRange: '< 2.5 ng/mL (40-59 años)' },
      { testDefinition: tests['PSA'], gender: RangeGender.MALE, ageMinMonths: 720, ageMaxMonths: null,
        maxValue: 3.5, unit: 'ng/mL', interpretation: 'Normal', textualRange: '< 3.5 ng/mL (≥ 60 años)' },

      // Tiempo de Protrombina
      { testDefinition: tests['TP'], gender: RangeGender.ANY, ageMinMonths: 0, ageMaxMonths: null,
        minValue: 11, maxValue: 14, unit: 'segundos', interpretation: 'Normal' },

      // TTP
      { testDefinition: tests['TTP'], gender: RangeGender.ANY, ageMinMonths: 0, ageMaxMonths: null,
        minValue: 25, maxValue: 35, unit: 'segundos', interpretation: 'Normal' },

      // INR
      { testDefinition: tests['INR'], gender: RangeGender.ANY, ageMinMonths: 0, ageMaxMonths: null,
        minValue: 0.8, maxValue: 1.2, unit: 'ratio', interpretation: 'Normal (sin anticoagulación)' },
    ];

    for (const r of ranges) {
      const td = r.testDefinition;
      const existing = await this.rangeRepo.findOne({
        where: {
          testDefinition: { id: td?.id },
          gender: r.gender,
          ageMinMonths: r.ageMinMonths,
          ageMaxMonths: r.ageMaxMonths ?? null,
        },
        relations: ['testDefinition'],
      });
      if (!existing) {
        await this.rangeRepo.save(this.rangeRepo.create(r as any));
      }
    }
    this.logger.log(`  ✅ ${ranges.length} rangos de referencia procesados`);
  }

  // ─── Perfiles ─────────────────────────────────────────────────────────────

  private async seedProfiles(
    sections: Record<string, TestSection>,
    tests: Record<string, TestDefinition>,
  ): Promise<void> {
    this.logger.log('📋 Creando perfiles...');

    const profilesData = [
      {
        section: sections['QS'],
        code: 'LIPID',
        name: 'Perfil Lipídico',
        description: 'Evaluación completa del metabolismo de lípidos.',
        price: 350,
        displayOrder: 1,
        testCodes: ['CTOT', 'TRIG', 'HDL', 'LDL'],
      },
      {
        section: sections['QS'],
        code: 'RENAL',
        name: 'Perfil Renal',
        description: 'Evaluación de la función renal y metabólica.',
        price: 200,
        displayOrder: 2,
        testCodes: ['CREAT', 'BUN', 'URIC'],
      },
      {
        section: sections['QS'],
        code: 'HEPAT',
        name: 'Perfil Hepático',
        description: 'Evaluación completa de la función hepática.',
        price: 380,
        displayOrder: 3,
        testCodes: ['TGO', 'TGP', 'BILT', 'BILD', 'PROT', 'ALB', 'FALC'],
      },
      {
        section: sections['QS'],
        code: 'QBAS',
        name: 'Química Sanguínea Básica',
        description: 'Perfil de química sanguínea de tamizaje general.',
        price: 450,
        displayOrder: 4,
        testCodes: ['GLUC', 'CREAT', 'BUN', 'URIC', 'TGO', 'TGP'],
      },
      {
        section: sections['HEM'],
        code: 'HEMO',
        name: 'Hemograma Completo (BHC)',
        description: 'Conteo completo de células sanguíneas con diferencial.',
        price: 200,
        displayOrder: 1,
        testCodes: ['HGB', 'HCT', 'GR', 'GB', 'PLAQ', 'DIFF'],
      },
      {
        section: sections['HOR'],
        code: 'TIRO',
        name: 'Perfil Tiroideo',
        description: 'Evaluación de la función tiroidea.',
        price: 380,
        displayOrder: 1,
        testCodes: ['TSH', 'T4L', 'T3L'],
      },
      {
        section: sections['SER'],
        code: 'PRENU',
        name: 'Panel Prenatal',
        description: 'Exámenes de tamizaje para control prenatal.',
        price: 450,
        displayOrder: 1,
        testCodes: ['VDRL', 'VIH', 'HBS', 'TOXIG', 'TOXIM'],
      },
      {
        section: sections['QS'],
        code: 'CHKUP',
        name: 'Check-up General',
        description: 'Paquete completo de revisión anual de salud.',
        price: 850,
        displayOrder: 5,
        testCodes: ['GLUC', 'CTOT', 'TRIG', 'HDL', 'LDL', 'CREAT', 'BUN', 'TGO', 'TGP', 'HGB', 'GB', 'PLAQ'],
      },
    ];

    for (const pd of profilesData) {
      let profile = await this.profileRepo.findOne({
        where: { code: pd.code },
        relations: ['tests'],
      });

      if (!profile) {
        const testEntities = pd.testCodes
          .map(c => tests[c])
          .filter(Boolean);

        profile = await this.profileRepo.save(
          this.profileRepo.create({
            section: pd.section,
            code: pd.code,
            name: pd.name,
            description: pd.description,
            price: pd.price,
            displayOrder: pd.displayOrder,
            isActive: true,
            tests: testEntities,
          }),
        );
        this.logger.log(`  ✅ Perfil: ${pd.name} (${testEntities.length} pruebas)`);
      } else {
        this.logger.log(`  ⏭️  Perfil ya existe: ${pd.name}`);
      }
    }
  }

  // ─── Médicos ──────────────────────────────────────────────────────────────

  private async seedDoctors(): Promise<void> {
    this.logger.log('👨‍⚕️ Creando médicos...');

    const doctors = [
      {
        firstName: 'Marco Antonio', lastName: 'Rivera Paz',
        specialty: 'Medicina Interna', licenseNumber: 'CM-10201',
        phone: '22341234', email: 'dr.rivera@nexoslabs.hn',
        institution: 'NEXOS Laboratorio Clínico', isStaff: true,
      },
      {
        firstName: 'Carolina', lastName: 'Mendoza Aguilar',
        specialty: 'Cardiología', licenseNumber: 'CM-10202',
        phone: '22341235', email: 'dra.mendoza@nexoslabs.hn',
        institution: 'NEXOS Laboratorio Clínico', isStaff: true,
      },
      {
        firstName: 'Luis Ernesto', lastName: 'Fernández Reyes',
        specialty: 'Medicina Familiar', licenseNumber: 'CM-10203',
        phone: '99887766', email: 'dr.fernandez@clinica.hn',
        institution: 'Clínica Médica San José', isStaff: false,
      },
      {
        firstName: 'Ana Patricia', lastName: 'Soto Vargas',
        specialty: 'Pediatría', licenseNumber: 'CM-10204',
        phone: '99776655', email: 'dra.soto@pediatria.hn',
        institution: 'Hospital Materno Infantil', isStaff: false,
      },
      {
        firstName: 'Roberto', lastName: 'Zelaya Martínez',
        specialty: 'Endocrinología', licenseNumber: 'CM-10205',
        phone: '22341236', email: 'dr.zelaya@nexoslabs.hn',
        institution: 'NEXOS Laboratorio Clínico', isStaff: true,
      },
    ];

    for (const d of doctors) {
      const existing = await this.doctorRepo.findOne({ where: { licenseNumber: d.licenseNumber } });
      if (!existing) {
        await this.doctorRepo.save(this.doctorRepo.create({ ...d, isActive: true }));
        this.logger.log(`  ✅ Dr/Dra. ${d.firstName} ${d.lastName} — ${d.specialty}`);
      } else {
        this.logger.log(`  ⏭️  Médico ya existe: ${d.firstName} ${d.lastName}`);
      }
    }
  }

  // ─── Pacientes ────────────────────────────────────────────────────────────

  private async seedPatients(): Promise<void> {
    this.logger.log('🧑‍🤝‍🧑 Creando pacientes...');

    const patients = [
      {
        name: 'Carlos Eduardo Mejía Flores',
        sex: Genres.MALE, birthDate: new Date('1979-03-15'), age: 45,
        dni: '0801197903456', phone: '99112233',
        email: 'carlos.mejia@gmail.com',
        bloodType: BloodType.O_POSITIVE,
        referenceGroup: 'Adulto',
        medicalHistory: 'Hipertensión arterial, Diabetes tipo 2',
        currentMedications: 'Metformina 850mg c/12h, Enalapril 20mg c/24h',
        address: 'Col. Kennedy, Calle 5, Casa #23, Tegucigalpa',
        emergencyContactName: 'María Flores de Mejía',
        emergencyContactRelationship: 'Esposa',
        emergencyContactPhone: '99112244',
      },
      {
        name: 'María Dolores García López',
        sex: Genres.FEMALE, birthDate: new Date('1986-07-22'), age: 38,
        dni: '0801198607891', phone: '99223344',
        email: 'maria.garcia@gmail.com',
        bloodType: BloodType.A_POSITIVE,
        referenceGroup: 'Adulto',
        medicalHistory: 'Hipotiroidismo',
        currentMedications: 'Levotiroxina 100mcg c/24h',
        address: 'Col. Palmira, Bloque B, Apt. 301, Tegucigalpa',
      },
      {
        name: 'José Antonio Hernández Valerio',
        sex: Genres.MALE, birthDate: new Date('1963-11-08'), age: 62,
        dni: '0801196311234', phone: '99334455',
        email: 'jose.hernandez@outlook.com',
        bloodType: BloodType.B_POSITIVE,
        referenceGroup: 'Adulto Mayor',
        medicalHistory: 'Hipertensión arterial, Dislipidemia, Artritis',
        currentMedications: 'Losartán 50mg c/24h, Atorvastatina 40mg c/24h',
        address: 'Res. Los Laureles, Casa #7, San Pedro Sula',
      },
      {
        name: 'Ana Lucía Ramírez Elvir',
        sex: Genres.FEMALE, birthDate: new Date('1996-05-14'), age: 29,
        dni: '0801199605321', phone: '99445566',
        email: 'ana.ramirez@yahoo.com',
        bloodType: BloodType.O_POSITIVE,
        referenceGroup: 'Adulto',
        address: 'Barrio El Centro, Calle Real, Edificio Torres, Apt. 4B',
      },
      {
        name: 'Pedro Luis Castillo Flores',
        sex: Genres.MALE, birthDate: new Date('2007-09-01'), age: 17,
        dni: null, phone: '99556677',
        email: null,
        bloodType: BloodType.O_NEGATIVE,
        referenceGroup: 'Adolescente',
        address: 'Col. Santa Fe, Calle 3, Casa #45, Comayagüela',
        emergencyContactName: 'Rosa Flores de Castillo',
        emergencyContactRelationship: 'Madre',
        emergencyContactPhone: '99556688',
      },
      {
        name: 'Elena Sofía Torres Andino',
        sex: Genres.FEMALE, birthDate: new Date('1970-01-28'), age: 55,
        dni: '0801197001567', phone: '99667788',
        email: 'elena.torres@gmail.com',
        bloodType: BloodType.AB_POSITIVE,
        referenceGroup: 'Adulto',
        medicalHistory: 'Diabetes tipo 2, Sobrepeso',
        currentMedications: 'Metformina 500mg c/12h',
        address: 'Col. Lomas del Guijarro Sur, Casa #89, Tegucigalpa',
      },
    ];

    for (const p of patients) {
      const existing = await this.patientRepo.findOne({
        where: p.dni ? { dni: p.dni } : { name: p.name },
      });
      if (!existing) {
        await this.patientRepo.save(this.patientRepo.create({ ...p, isActive: true }));
        this.logger.log(`  ✅ Paciente: ${p.name}`);
      } else {
        this.logger.log(`  ⏭️  Paciente ya existe: ${p.name}`);
      }
    }
  }
}
