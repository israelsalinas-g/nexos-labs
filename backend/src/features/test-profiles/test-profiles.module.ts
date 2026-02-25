import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestProfilesService } from './test-profiles.service';
import { TestProfilesController } from './test-profiles.controller';
import { TestProfile } from '../../entities/test-profile.entity';
import { TestDefinition } from '../../entities/test-definition.entity';
import { TestSection } from '../../entities/test-section.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TestProfile, TestDefinition, TestSection])],
  controllers: [TestProfilesController],
  providers: [TestProfilesService],
  exports: [TestProfilesService]
})
export class TestProfilesModule {}
