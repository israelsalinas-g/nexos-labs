import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestDefinitionsService } from './test-definitions.service';
import { TestDefinitionsController } from './test-definitions.controller';
import { TestDefinition } from '../../entities/test-definition.entity';
import { TestSection } from '../../entities/test-section.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TestDefinition, TestSection])],
  controllers: [TestDefinitionsController],
  providers: [TestDefinitionsService],
  exports: [TestDefinitionsService]
})
export class TestDefinitionsModule {}
