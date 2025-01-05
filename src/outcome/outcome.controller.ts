import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { OutcomeService } from './outcome.service';
import { CreateOutcomeDto } from './dto/create-outcome.dto';
import { UpdateOutcomeDto } from './dto/update-outcome.dto';
import { ApiOperation, ApiParam,  } from '@nestjs/swagger';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/admin/admin.guard';

@UseGuards(AdminGuard)
@ApiBearerAuth()
@ApiTags('Outcome')
@Controller('outcome')
export class OutcomeController {
  constructor(private readonly outcomeService: OutcomeService) {}

  @Post()
  create(@Body() createOutcomeDto: CreateOutcomeDto) {
    return this.outcomeService.create(createOutcomeDto);
  }

  @Get()
  findAll() {
    return this.outcomeService.findAll();
  }

  @ApiOperation({ summary: 'Find some outcomes' })
  @ApiParam({ name: 'take', required: true, type: 'number' })
  @ApiParam({ name: 'skip', required: true, type: 'number' })
  @Get('some')
  findSome(@Param('take') take: number, @Param('skip') skip: number) {
    return this.outcomeService.findSome(+take, +skip);
  }

  @Get('byId/:id')
  findOne(@Param('id') id: string) {
    return this.outcomeService.findOne(+id);
  }

  @Patch('byId/:id')
  update(@Param('id') id: string, @Body() updateOutcomeDto: UpdateOutcomeDto) {
    return this.outcomeService.update(+id, updateOutcomeDto);
  }

  @Delete('byId/:id')
  remove(@Param('id') id: string) {

    console.log("outcome deletion");

    return this.outcomeService.remove(+id);
  }
}
