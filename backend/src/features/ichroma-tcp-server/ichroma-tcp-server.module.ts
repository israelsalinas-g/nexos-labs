import { Module } from '@nestjs/common';
import { IChromaTcpServerService } from './ichroma-tcp-server.service';
import { IChromaResultsModule } from '../ichroma-results/ichroma-results.module';


@Module({
  imports: [IChromaResultsModule],
  providers: [IChromaTcpServerService],
  exports: [IChromaTcpServerService],
})
export class IChromaTcpServerModule {}