import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestSectionsService } from './test-sections.service';
import { TestSectionsController } from './test-sections.controller';
import { TestSection } from '../../entities/test-section.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TestSection])],
  controllers: [TestSectionsController],
  providers: [TestSectionsService],
  exports: [TestSectionsService]
})
export class TestSectionsModule {}
