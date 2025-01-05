import { Module } from '@nestjs/common';
import { CarService } from './car.service';
import { CarController } from './car.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [CarController],
  providers: [CarService, PrismaService],
})
export class CarModule {}
