import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

// Entities
import { Patient } from '../../entities/patient.entity';
import { UrineTest } from '../../entities/urine-test.entity';
import { DymindDh36Result } from '../../entities/dymind-dh36-result.entity';
import { IChromaResult } from '../../entities/ichroma-result.entity';
import { StoolTest } from '../../entities/stool-test.entity';
import { Doctor } from '../../entities/doctor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Patient,
      UrineTest,
      DymindDh36Result,
      IChromaResult,
      StoolTest,
      Doctor,
    ])
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService] // Exportamos el servicio por si otros módulos lo necesitan
})
export class DashboardModule {}