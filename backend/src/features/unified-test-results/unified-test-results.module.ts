import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnifiedTestResultsService } from './unified-test-results.service';
import { UnifiedTestResultsController } from './unified-test-results.controller';
import { UnifiedTestResult } from '../../entities/unified-test-result.entity';
import { TestDefinition } from '../../entities/test-definition.entity';
import { TestReferenceRange } from '../../entities/test-reference-range.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UnifiedTestResult, TestDefinition, TestReferenceRange])],
  controllers: [UnifiedTestResultsController],
  providers: [UnifiedTestResultsService],
  exports: [UnifiedTestResultsService],
})
export class UnifiedTestResultsModule {}
