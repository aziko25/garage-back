import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class OperatorService {
  constructor(
    // private readonly prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
  async login(name: string, password: string) {
    if (!(await bcrypt.compare(password, process.env.OPERATOR_PASSWORD))) {
      throw new HttpException('Wrong password', HttpStatus.UNAUTHORIZED);
    }
    const payload = { sub: 1, name: process.env.ADMIN_NAME };
    return {
      access_token: await this.jwtService.signAsync(payload),
      name: process.env.ADMIN_NAME,
      role: 'operator',
    };
  }
}
