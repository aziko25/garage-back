import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateRentDto } from './dto/create-rent.dto';
import { CreateRentExtensionDto } from './dto/create-rent-extension.dto';
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
      include: {
        Rent_Extensions: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });    
  }

  async createExtension(id: string, createRentExtensionDto: CreateRentExtensionDto) {
    try {
      console.log("API request received");
  
      // Validate the number of days
      if (createRentExtensionDto.extendedDaysQuantity <= 0) {
        throw new HttpException('Days must be greater than 0', HttpStatus.BAD_REQUEST);
      }
  
      const rentId = parseInt(id, 10);
  
      // Check if the Rent record exists
      const rent = await this.prisma.rent.findUnique({
        where: { id: rentId },
      });

      await this.prisma.rent.update({
        where: { id: rentId },
        data: {
          isRentExtended: true,
        }
      });
  
      if (!rent) {
        throw new HttpException('Rent record not found', HttpStatus.NOT_FOUND);
      }
  
      // Create a new rent extension
      return await this.prisma.rent_Extensions.create({
        data: {
          rentId,
          extendedDaysQuantity: createRentExtensionDto.extendedDaysQuantity,
          status: createRentExtensionDto.status,
          amount: createRentExtensionDto.amount,
          paymentType: createRentExtensionDto.paymentType,
        },
      });
    } catch (error) {
      console.error('Error creating rent extension:', error.message || error);
      throw new HttpException(error.message || 'Internal Server Error', HttpStatus.BAD_REQUEST);
    }
  }  

  async updateExtension(
    id: string,
    updateRentExtensionDto: Partial<CreateRentExtensionDto>,
  ) {
    try {
      console.log("API update request received");
  
      const extensionId = parseInt(id, 10);
  
      // Check if the rent extension record exists
      const extension = await this.prisma.rent_Extensions.findUnique({
        where: { id: extensionId },
      });
  
      if (!extension) {
        throw new HttpException(
          'Rent extension record not found',
          HttpStatus.NOT_FOUND,
        );
      }
  
      // Validate the update data
      if (
        updateRentExtensionDto.extendedDaysQuantity !== undefined &&
        updateRentExtensionDto.extendedDaysQuantity <= 0
      ) {
        throw new HttpException(
          'Days must be greater than 0',
          HttpStatus.BAD_REQUEST,
        );
      }
  
      // Update the rent extension record
      return await this.prisma.rent_Extensions.update({
        where: { id: extensionId },
        data: {
          extendedDaysQuantity: updateRentExtensionDto.extendedDaysQuantity,
          status: updateRentExtensionDto.status,
          amount: updateRentExtensionDto.amount,
          paymentType: updateRentExtensionDto.paymentType,
        },
      });
    } catch (error) {
      console.error('Error updating rent extension:', error.message || error);
      throw new HttpException(
        error.message || 'Internal Server Error',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteExtension(id: number) {

    return await this.prisma.rent_Extensions.delete({
      where: { id: +id },
    });
  }
  
  async getExtensionById(id: number) {

    return await this.prisma.rent_Extensions.findUnique({
      where: { id: +id },
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
