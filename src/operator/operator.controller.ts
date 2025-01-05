import { Controller, Post, Body } from '@nestjs/common';
import { OperatorService } from './operator.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Operator')
@Controller('operator')
export class OperatorController {
  constructor(private readonly operatorService: OperatorService) {}

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
  @Post('/login')
  @ApiOperation({ summary: 'Login with admin name and password' })
  login(@Body() body: { name: string; password: string }) {
    return this.operatorService.login(body.name, body.password);
  }
}
