import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DymindDh36Result, TestParameter } from '../entities/dymind-dh36-result.entity';
import { Patient } from '../entities/patient.entity';
import { IChromaResult } from '../entities/ichroma-result.entity';
import { UrineTest } from '../entities/urine-test.entity';
import { StoolTest } from '../entities/stool-test.entity';
import { Doctor, TestSection, LaboratoryOrder, OrderTest, TestDefinition, TestProfile, TestResult } from 'src/entities';
config();

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get<number>('DB_PORT', 5432),
  username: configService.get('DB_USERNAME', 'postgres'),
  password: configService.get('DB_PASSWORD', 'password'),
  database: configService.get('DB_DATABASE', 'nexos_labs_db'),
  entities: [
     Doctor,
        Patient,
        TestSection,
        TestDefinition,
        TestProfile,
        TestResult,
        LaboratoryOrder,
        OrderTest,
        DymindDh36Result,
        IChromaResult,
        UrineTest,
        StoolTest,
  ],
  migrations: ['src/migrations/*.ts'],
  synchronize: true, // Volver a false por seguridad
  dropSchema: true, // Volver a false por seguridad
});
