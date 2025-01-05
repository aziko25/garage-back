import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { PrismaService } from './prisma.service';
import { OperatorModule } from './operator/operator.module';
import { CarModule } from './car/car.module';
import { RentModule } from './rent/rent.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { OutcomeModule } from './outcome/outcome.module';
import { IncomeModule } from './income/income.module';

@Module({
  imports: [
    AdminModule,
    OperatorModule,
    CarModule,
    RentModule,
    MonitoringModule,
    OutcomeModule,
    IncomeModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
