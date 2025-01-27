import { ApiProperty } from '@nestjs/swagger';
import { Status, PaymentType } from '@prisma/client';

export class CreateRentExtensionDto {

  extendedDaysQuantity: number;

  startDate: Date;
  endDate: Date;

  @ApiProperty({ enum: ['PAID', 'IN_PROCESS', 'DUTY'] })
  status: Status;

  amount: number;
  amountPaid: number;
  @ApiProperty({ enum: ['CASH', 'CARD'] })
  paymentType: PaymentType;
  @ApiProperty({ enum: ['CASH', 'CARD'] })
  amountPaidPaymentType: PaymentType;
}
