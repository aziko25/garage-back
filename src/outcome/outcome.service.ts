import { Injectable } from '@nestjs/common';
import { CreateOutcomeDto } from './dto/create-outcome.dto';
import { UpdateOutcomeDto } from './dto/update-outcome.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class OutcomeService {
  constructor(private prisma: PrismaService) {}
  async create(createOutcomeDto: CreateOutcomeDto) {
    return await this.prisma.outcome.create({
      data: createOutcomeDto,
    });
  }

  async findAll() {
    return await this.prisma.outcome.findMany();
  }

  async findSome(take: number, skip: number) {
    return await this.prisma.outcome.findMany({
      take: take,
      skip: skip,
    });
  }

  async findOne(id: number) {
    return await this.prisma.outcome.findUnique({
      where: {
        id: id,
      },
    });
  }

  async update(id: number, updateOutcomeDto: UpdateOutcomeDto) {
    return await this.prisma.outcome.update({
      where: {
        id: id,
      },
      data: updateOutcomeDto,
    });
  }

  async remove(id: number) {
    return await this.prisma.outcome.delete({
      where: {
        id: id,
      },
    });
  }
}
