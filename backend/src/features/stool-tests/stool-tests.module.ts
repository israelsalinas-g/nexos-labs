import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoolTestsService } from './stool-tests.service';
import { StoolTestsController } from './stool-tests.controller';
import { PdfStoolReportService } from './pdf-stool-report.service';
import { StoolTest } from '../../entities/stool-test.entity';
import { Patient } from '../../entities/patient.entity';
import { LabSettingsModule } from '../lab-settings/lab-settings.module';

@Module({
  imports: [TypeOrmModule.forFeature([StoolTest, Patient]), LabSettingsModule],
  controllers: [StoolTestsController],
  providers: [StoolTestsService, PdfStoolReportService],
  exports: [StoolTestsService],
})
export class StoolTestsModule {}