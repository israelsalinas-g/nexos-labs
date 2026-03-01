import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrineTestsService } from './urine-tests.service';
import { UrineTestsController } from './urine-tests.controller';
import { PdfUrineReportService } from './pdf-urine-report.service';
import { UrineTest } from '../../entities/urine-test.entity';
import { Patient } from '../../entities/patient.entity';
import { LabSettingsModule } from '../lab-settings/lab-settings.module';

@Module({
  imports: [TypeOrmModule.forFeature([UrineTest, Patient]), LabSettingsModule],
  controllers: [UrineTestsController],
  providers: [UrineTestsService, PdfUrineReportService],
  exports: [UrineTestsService],
})
export class UrineTestsModule {}