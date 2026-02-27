import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestDefinitionsService } from './test-definitions.service';
import { TestDefinitionsController } from './test-definitions.controller';
import { TestDefinition } from '../../entities/test-definition.entity';
import { TestSection } from '../../entities/test-section.entity';
import { TestResponseType } from '../../entities/test-response-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TestDefinition, TestSection, TestResponseType])],
  controllers: [TestDefinitionsController],
  providers: [TestDefinitionsService],
  exports: [TestDefinitionsService]
})
export class TestDefinitionsModule {}
