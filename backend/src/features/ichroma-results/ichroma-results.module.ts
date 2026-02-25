import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IChromaResultsService } from './ichroma-results.service';
import { IChromaResultsController } from './ichroma-results.controller';
import { IChromaResult } from '../../entities/ichroma-result.entity';
import { Patient } from '../../entities/patient.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IChromaResult, Patient])],
  controllers: [IChromaResultsController],
  providers: [IChromaResultsService],
  exports: [IChromaResultsService],
})
export class IChromaResultsModule {}