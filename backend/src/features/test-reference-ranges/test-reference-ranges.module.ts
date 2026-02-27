import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestReferenceRangesService } from './test-reference-ranges.service';
import { TestReferenceRangesController } from './test-reference-ranges.controller';
import { TestReferenceRange } from '../../entities/test-reference-range.entity';
import { TestDefinition } from '../../entities/test-definition.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TestReferenceRange, TestDefinition])],
  controllers: [TestReferenceRangesController],
  providers: [TestReferenceRangesService],
  exports: [TestReferenceRangesService],
})
export class TestReferenceRangesModule {}
