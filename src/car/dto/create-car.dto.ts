import { ApiProperty } from '@nestjs/swagger';
import { Owner } from '@prisma/client';

export class CreateCarDto {
  model: string;
  carNumber: string;
  run: string;
  @ApiProperty({ enum: ['ADMIN', 'PARTNER', 'INVESTOR'] })
  owner: Owner;
}
