import { Module } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { MonitoringController } from './monitoring.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [MonitoringController],
  providers: [MonitoringService, PrismaService],
})
export class MonitoringModule {}
