import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientHistoryService } from './patient-history.service';
import { PatientHistoryController } from './patient-history.controller';
import { Patient } from '../../entities/patient.entity';
import { DymindDh36Result } from '../../entities/dymind-dh36-result.entity';
import { IChromaResult } from '../../entities/ichroma-result.entity';
import { UrineTest } from '../../entities/urine-test.entity';
import { StoolTest } from '../../entities/stool-test.entity';
import { UnifiedTestResult } from '../../entities/unified-test-result.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Patient,
      DymindDh36Result,
      IChromaResult,
      UrineTest,
      StoolTest,
      UnifiedTestResult,
    ])
  ],
  controllers: [PatientHistoryController],
  providers: [PatientHistoryService],
  exports: [PatientHistoryService],
})
export class PatientHistoryModule {}