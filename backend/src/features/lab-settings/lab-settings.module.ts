import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { LabSettingsService } from './lab-settings.service';
import { LabSettingsController } from './lab-settings.controller';
import { LabSetting } from '../../entities/lab-setting.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([LabSetting]),
  ],
  controllers: [LabSettingsController],
  providers: [LabSettingsService],
  exports: [LabSettingsService],
})
export class LabSettingsModule {}
