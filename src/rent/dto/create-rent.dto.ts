import { ApiProperty } from '@nestjs/swagger';
import { Status, PaymentType } from '@prisma/client';

export class CreateRentDto {
  name: string;
  phoneNumber: string;
  startDate: Date;
  endDate: Date;
  initialEndData: Date;
  @ApiProperty({ enum: ['PAID', 'IN_PROCESS', 'DUTY'] })
  status: Status;
  guaranteeType: PaymentType;
  guaranteeAmount: number;
  amount: number;
  amountPaid: number;
  @ApiProperty({ enum: ['CASH', 'CARD'] })
  paymentType: PaymentType;
  @ApiProperty({ enum: ['CASH', 'CARD'] })
  amountPaidPaymentType: PaymentType;

  @ApiProperty({
    type: 'array',
    items: { type: 'number' },
    minItems: 3,
    maxItems: 3,
    example: [40, 30, 30],
  })
  incomePersentage: number[];
  isGuaranteeReturned: boolean;
  carId: number;
}
