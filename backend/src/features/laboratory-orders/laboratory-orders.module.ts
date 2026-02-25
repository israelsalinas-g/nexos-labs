import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LaboratoryOrdersController } from './laboratory-orders.controller';
import { LaboratoryOrdersService } from './laboratory-orders.service';

import { OrderTest,
LaboratoryOrder,
Doctor,
Patient,
TestResult,
TestDefinition,
TestSection,
TestProfile } from '../../entities';

@Module({
  imports: [
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
      TestProfile
    ])
  ],
  controllers: [LaboratoryOrdersController],
  providers: [LaboratoryOrdersService],
  exports: [LaboratoryOrdersService]
})
export class LaboratoryOrdersModule {}