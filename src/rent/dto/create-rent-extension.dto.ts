import { ApiProperty } from '@nestjs/swagger';
import { Status, PaymentType } from '@prisma/client';

export class CreateRentExtensionDto {

  extendedDaysQuantity: number;

  @ApiProperty({ enum: ['PAID', 'IN_PROCESS', 'DUTY'] })
  status: Status;

  amount: number;
  @ApiProperty({ enum: ['CASH', 'CARD'] })
  paymentType: PaymentType;
}
