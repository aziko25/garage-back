import { Module } from '@nestjs/common';
import { OutcomeService } from './outcome.service';
import { OutcomeController } from './outcome.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [OutcomeController],
  providers: [OutcomeService, PrismaService],
})
export class OutcomeModule {}
