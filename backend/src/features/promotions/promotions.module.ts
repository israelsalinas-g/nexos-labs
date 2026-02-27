import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionsService } from './promotions.service';
import { PromotionsController } from './promotions.controller';
import { Promotion } from '../../entities/promotion.entity';
import { TestDefinition } from '../../entities/test-definition.entity';
import { TestProfile } from '../../entities/test-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Promotion, TestDefinition, TestProfile])],
  controllers: [PromotionsController],
  providers: [PromotionsService],
  exports: [PromotionsService],
})
export class PromotionsModule {}
