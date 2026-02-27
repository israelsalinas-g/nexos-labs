import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LaboratoryOrdersController } from './laboratory-orders.controller';
import { LaboratoryOrdersService } from './laboratory-orders.service';
import { NotificationsModule } from '../notifications/notifications.module';

import { OrderTest,
LaboratoryOrder,
Doctor,
Patient,
TestResult,
TestDefinition,
TestSection,
TestProfile,
Promotion } from '../../entities';
import { UnifiedTestResult } from '../../entities/unified-test-result.entity';

@Module({
  imports: [
    NotificationsModule,
    TypeOrmModule.forFeature([
      // Entidades principales
      LaboratoryOrder,
      OrderTest,
      Doctor,
      Patient,

      // Entidades de resultados y definiciones
      TestResult,
      TestDefinition,
      TestSection,
      TestProfile,
      Promotion,
      UnifiedTestResult,
    ])
  ],
  controllers: [LaboratoryOrdersController],
  providers: [LaboratoryOrdersService],
  exports: [LaboratoryOrdersService]
})
export class LaboratoryOrdersModule {}