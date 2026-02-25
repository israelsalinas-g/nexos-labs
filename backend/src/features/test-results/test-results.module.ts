import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestResultsService } from './test-results.service';
import { TestResultsController } from './test-results.controller';
import { TestResult } from '../../entities/test-result.entity';
import { OrderTest } from '../../entities/order-test.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TestResult, OrderTest])],
  controllers: [TestResultsController],
  providers: [TestResultsService],
  exports: [TestResultsService],
})
export class TestResultsModule {}