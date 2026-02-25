import { Module } from '@nestjs/common';
import { LisServerService } from './lis-server.service';
import { LisServerController } from './lis-server.controller';
import { DymindDh36ResultsModule } from '../../features/dymind-dh36-results/dymind-dh36-results.module';

@Module({
  imports: [DymindDh36ResultsModule],
  controllers: [LisServerController],
  providers: [LisServerService],
  exports: [LisServerService],
})
export class LisServerModule {}
