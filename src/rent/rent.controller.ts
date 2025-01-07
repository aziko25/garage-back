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
import { RentService } from './rent.service';
import { CreateRentDto } from './dto/create-rent.dto';
import { UpdateRentDto } from './dto/update-rent.dto';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { ApiBearerAuth } from '@nestjs/swagger';
import { AdminGuard } from 'src/admin/admin.guard';
import { Query } from '@nestjs/common';

@UseGuards(AdminGuard)
@ApiBearerAuth()
@ApiTags('Rent')
@Controller('rent')
export class RentController {
  constructor(private readonly rentService: RentService) {}

  @Post()
  create(@Body() createRentDto: CreateRentDto) {
    return this.rentService.create(createRentDto);
  }

  @Get()
  findAll(
        @Query('guaranteeCard') guaranteeCard: string | null,
        @Query('guaranteeCash') guaranteeCash: string | null) {

        const guaranteeCardBool = guaranteeCard === 'true' ? true : false;
        const guaranteeCashBool = guaranteeCash === 'true' ? true : false;
      
        return this.rentService.findAll(guaranteeCardBool, guaranteeCashBool);
  }

  @ApiOperation({ summary: 'Get some rents with pagination' })
  @ApiParam({
    name: 'take',
    description: 'Number of items to take',
    type: 'number',
  })
  @ApiParam({
    name: 'skip',
    description: 'Number of items to skip',
    type: 'number',
  })
  @Get('some/:take/:skip')
  findSome(@Param('take') take: string, @Param('skip') skip: string) {
    return this.rentService.findSome(+take, +skip);
  }

  @Get('byId/:id')
  findOne(@Param('id') id: string) {
    return this.rentService.findOne(+id);
  }

  @Get('search/:search')
  search(@Param('search') search: string) {
    return this.rentService.search(search);
  }

  @Patch('byId/:id')
  update(@Param('id') id: string, @Body() updateRentDto: UpdateRentDto) {
    return this.rentService.update(+id, updateRentDto);
  }
  @Delete('byId/:id')
  remove(@Param('id') id: string) {

    console.log("rent deletion");

    return this.rentService.remove(+id);
  }
}
