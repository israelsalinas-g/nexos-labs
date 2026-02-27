import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { NotificationsService } from './notifications.service';
import { LaboratoryOrder } from '../../entities/laboratory-order.entity';
import { OrderTest } from '../../entities/order-test.entity';
import { UnifiedTestResult } from '../../entities/unified-test-result.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([LaboratoryOrder, OrderTest, UnifiedTestResult]),
  ],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
