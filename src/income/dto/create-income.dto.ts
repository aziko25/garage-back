import { ApiProperty } from '@nestjs/swagger';
import { Owner } from '@prisma/client';

export class CreateIncomeDto {
  @ApiProperty({ enum: ['ADMIN', 'PARTNER', 'INVESTOR'] })
  owner: Owner;
  comment: string;
  amount: number;
}
