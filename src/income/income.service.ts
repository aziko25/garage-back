import { Injectable } from '@nestjs/common';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class IncomeService {
  constructor(private prisma: PrismaService) {}
  async create(createIncomeDto: CreateIncomeDto) {
    return await this.prisma.income.create({
      data: createIncomeDto,
    });
  }

  async findAll() {
    return await this.prisma.income.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} income`;
  }

  update(id: number, updateIncomeDto: UpdateIncomeDto) {
    return `This action updates a #${id} income`;
  }

  async remove(id: number) {

    return await this.prisma.income.delete({
      where: { id: +id },
    });
  }
}
