import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateRentDto } from './dto/create-rent.dto';
import { UpdateRentDto } from './dto/update-rent.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class RentService {
  constructor(private prisma: PrismaService) {}
  async create(createRentDto: CreateRentDto) {
    try {
      if (
        createRentDto.incomePersentage[0] +
          createRentDto.incomePersentage[1] +
          createRentDto.incomePersentage[2] !=
        100
      ) {
        throw new HttpException(
          'Income persentage must be 100',
          HttpStatus.BAD_REQUEST,
        );
      }
      return await this.prisma.rent.create({
        data: {
          ...createRentDto,
          adminIncome:
            (createRentDto.amount * createRentDto.incomePersentage[0]) / 100,
          investorIncome:
            (createRentDto.amount * createRentDto.incomePersentage[1]) / 100,
          partnerIncome:
            (createRentDto.amount * createRentDto.incomePersentage[2]) / 100,
        },
      });
    } catch (error) {
      console.log(error);
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async findAll(guaranteeCard: boolean | null, guaranteeCash: boolean | null) {

    const whereConditions: any[] = [];
  
    // Add the guaranteeType condition if either guaranteeCash or guaranteeCard is true
    if (guaranteeCash) {
      whereConditions.push({ guaranteeType: 'CASH' });
      whereConditions.push({ isGuaranteeReturned: false });
    }
    if (guaranteeCard) {
      whereConditions.push({ guaranteeType: 'CARD' });
      whereConditions.push({ isGuaranteeReturned: false });
    }

    return await this.prisma.rent.findMany({
      where: {
        AND: whereConditions,
      },
      orderBy: {
        id: 'desc',
      },
    });    
  }

  async findSome(take: number, skip: number) {
    try {
      return await this.prisma.rent.findMany({
        orderBy: { id: 'desc' },
        take: take,
        skip: skip,
      });
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async findOne(id: number) {
    return await this.prisma.rent.findUnique({
      where: { id: +id },
    });
  }

  async search(search: string) {
    return await this.prisma.rent.findMany({
      where: {
        OR: [
          {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            phoneNumber: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      },
    });
  }
  async update(id: number, updateRentDto: UpdateRentDto) {
    return await this.prisma.rent.update({
      where: { id: id },
      data: {
        ...updateRentDto,
        adminIncome:
          (updateRentDto.amount * updateRentDto.incomePersentage[0]) / 100,
        investorIncome:
          (updateRentDto.amount * updateRentDto.incomePersentage[1]) / 100,
        partnerIncome:
          (updateRentDto.amount * updateRentDto.incomePersentage[2]) / 100,
      },
    });
  }

  async remove(id: number) {
    return await this.prisma.rent.delete({
      where: { id: +id },
    });
  }
}
