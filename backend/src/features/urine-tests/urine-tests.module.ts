import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrineTestsService } from './urine-tests.service';
import { UrineTestsController } from './urine-tests.controller';
import { UrineTest } from '../../entities/urine-test.entity';
import { Patient } from '../../entities/patient.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UrineTest, Patient])],
  controllers: [UrineTestsController],
  providers: [UrineTestsService],
  exports: [UrineTestsService],
})
export class UrineTestsModule {}