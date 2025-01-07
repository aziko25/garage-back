import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from './admin.guard';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiBody({
    description: 'Login with admin name and password',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        password: { type: 'string' },
      },
    },
  })
  @Post('login')
  @ApiOperation({ summary: 'Login with admin name and password' })
  login(@Body() body: { name: string; password: string }) {

    console.log("api incoming")

    console.log(body.name, " ", body.password);

    return this.adminService.login(body.name, body.password);
  }

  // @UseGuards(AdminGuard)
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Get count of students' })
  // @Get('students-count')
  // async getUser() {
  //   return await this.adminService.getStudentCount();
  // }

  // @UseGuards(AdminGuard)
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Get all students' })
  // @Get('show-all-users')
  // findAll() {
  //   return this.adminService.findAll();
  // }
}
