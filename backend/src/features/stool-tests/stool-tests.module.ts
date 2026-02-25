import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoolTestsService } from './stool-tests.service';
import { StoolTestsController } from './stool-tests.controller';
import { StoolTest } from '../../entities/stool-test.entity';
import { Patient } from '../../entities/patient.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StoolTest, Patient])],
  controllers: [StoolTestsController],
  providers: [StoolTestsService],
  exports: [StoolTestsService],
})
export class StoolTestsModule {}