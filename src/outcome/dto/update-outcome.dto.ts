import { PartialType } from '@nestjs/swagger';
import { CreateOutcomeDto } from './create-outcome.dto';

export class UpdateOutcomeDto extends PartialType(CreateOutcomeDto) {}
