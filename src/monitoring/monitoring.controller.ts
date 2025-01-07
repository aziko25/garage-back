import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { ApiBearerAuth } from '@nestjs/swagger';
import { AdminGuard } from 'src/admin/admin.guard';
import { Query } from '@nestjs/common';

@UseGuards(AdminGuard)
@ApiBearerAuth()
@ApiTags('Monitoring')
@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @ApiOperation({ summary: 'Paginated list of rents' })
  @Get('rents')
  findRents(
    @Query('page') page: string = '1', // Default to page 1
    @Query('pageSize') pageSize: string = '10', // Default page size
  ) {
    return this.monitoringService.findRents(+page, +pageSize);
  }

  @ApiOperation({ summary: 'Paginated sum for a specific month' })
  @Get('sum')
  findIncome(
    @Query('page') page: string = '1', // Default to page 1
    @Query('pageSize') pageSize: string = '10', // Default page size
  ) {
    return this.monitoringService.findIncome(+page, +pageSize);
  }


  @ApiOperation({ summary: 'Rents count for month' })
  @Get('rents/:year/:month')
  findRentsByMonth(
    @Param('year') year: string,
    @Param('month') month: string,
  ) {

    return this.monitoringService.findRentsByMonth(+year, +month);
}

  @ApiOperation({ summary: 'Sum for month ' })
  @Get('sum/:year/:month')
  findIncomeByMonth(
    @Param('year') year: string,
    @Param('month') month: string,
  ) {
    return this.monitoringService.findIncomeByMonth(+year, +month);
  }


  @ApiOperation({ summary: 'Owners income or real balance  ' })
  @Get('ownersIncome')
  findIncomeByPersentage() {
    return this.monitoringService.findIncomeByPersentage();
  }

  /*@Get('history/:year/:month')
  findHistoryByMonth(
    @Param('year') year: string,
    @Param('month') month: string,
  ) {
    return this.monitoringService.findHistory(+year, +month);
  }*/


    @ApiOperation({ summary: 'History with pagination' })
    @Get('history')
    findHistoryWithPagination(
    @Query('page') page: number = 1, 
    @Query('pageSize') pageSize: number = 10
    ) {
    return this.monitoringService.findHistory(page, pageSize);
    }

}
