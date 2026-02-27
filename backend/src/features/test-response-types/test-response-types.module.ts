import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestResponseTypesService } from './test-response-types.service';
import { TestResponseTypesController } from './test-response-types.controller';
import { TestResponseType } from '../../entities/test-response-type.entity';
import { TestResponseOption } from '../../entities/test-response-option.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TestResponseType, TestResponseOption])],
  controllers: [TestResponseTypesController],
  providers: [TestResponseTypesService],
  exports: [TestResponseTypesService],
})
export class TestResponseTypesModule {}
