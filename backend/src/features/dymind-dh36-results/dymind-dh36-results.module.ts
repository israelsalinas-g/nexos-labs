import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DymindDh36ResultsService } from './dymind-dh36-results.service';
import { DymindDh36ResultsController } from './dymind-dh36-results.controller';
import { DymindDh36Result } from '../../entities/dymind-dh36-result.entity';
import { Patient } from '../../entities/patient.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DymindDh36Result, Patient])],
  controllers: [DymindDh36ResultsController],
  providers: [DymindDh36ResultsService],
  exports: [DymindDh36ResultsService],
})
export class DymindDh36ResultsModule {}
