import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DymindDh36Result, TestParameter } from '../entities/dymind-dh36-result.entity';
import { Patient } from '../entities/patient.entity';
import { IChromaResult } from '../entities/ichroma-result.entity';
import { UrineTest } from '../entities/urine-test.entity';
import { StoolTest } from '../entities/stool-test.entity';
import { Doctor } from '../entities/doctor.entity';
import { LaboratoryOrder } from '../entities/laboratory-order.entity';
import { OrderTest } from '../entities/order-test.entity';
import { TestResult } from '../entities/test-result.entity';
import { TestDefinition } from '../entities/test-definition.entity';
import { TestSection } from '../entities/test-section.entity';
import { TestProfile } from '../entities/test-profile.entity';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const isProduction = configService.get('NODE_ENV') === 'production';
  
  return {
    type: 'postgres',
    host: configService.get('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get('DB_USERNAME', 'postgres'),
    password: configService.get('DB_PASSWORD', 'password'),
    database: configService.get('DB_DATABASE', 'nexos_labs_db'),
    entities: [
      // Entidades principales
      Patient,
      Doctor,
      
      // Entidades de órdenes y resultados
      LaboratoryOrder,
      OrderTest,
      TestResult,
      
      // Entidades de definición de pruebas
      TestSection,
      TestDefinition,
      TestProfile,
      
      // Entidades específicas de pruebas
      DymindDh36Result,
      IChromaResult,
      UrineTest,
      StoolTest
    ],
    synchronize: true, // Habilitado para recrear la base de datos
    logging: !isProduction,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    retryAttempts: 3,
    retryDelay: 3000,
    autoLoadEntities: true,
  };
};
