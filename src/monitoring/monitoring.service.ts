import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class MonitoringService {
  constructor(private prisma: PrismaService) {}

  async findRents(page: number, pageSize: number) {
    
    page = Math.max(page, 1); // Ensure page is at least 1
    pageSize = Math.max(pageSize, 1); // Ensure pageSize is at least 1
    const skip = (page - 1) * pageSize;
  
    return await this.prisma.rent.count({
      where: {
        OR: [{ status: 'PAID' }, { status: 'DUTY' }],
      },
      skip,
      take: pageSize,
    });
  }
  
  async findIncome(page: number, pageSize: number) {
    
    page = Math.max(page, 1); // Ensure page is at least 1
    pageSize = Math.max(pageSize, 1); // Ensure pageSize is at least 1
    const skip = (page - 1) * pageSize;
    const take = pageSize;
  
    const rentIncome = await this.prisma.rent.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: {
          in: ['PAID', 'DUTY'], // Status should be 'PAID' or 'DUTY'
        },
      },
      skip,
      take: take,
    });
  
    const income = await this.prisma.income.aggregate({
      _sum: {
        amount: true,
      },
      where: {},
      skip,
      take: take,
    });
  
    const outcome = await this.prisma.outcome.aggregate({
      _sum: {
        amount: true,
      },
      where: {},
      skip,
      take: take,
    });
  
    const duty = await this.prisma.rent.aggregate({
      _sum: {
        guaranteeAmount: true,
      },
      where: {
        status: 'DUTY',
      },
      skip,
      take: take,
    });
  
    const cash_duty = await this.prisma.rent.aggregate({
      _sum: {
        guaranteeAmount: true,
      },
      where: {
        status: 'DUTY',
        guaranteeType: 'CASH',
      },
      skip,
      take: take,
    });
  
    const card_duty = await this.prisma.rent.aggregate({
      _sum: {
        guaranteeAmount: true,
      },
      where: {
        status: 'DUTY',
        guaranteeType: 'CARD',
      },
      skip,
      take: take,
    });
  
    const cash_pledge = await this.prisma.rent.aggregate({
      _sum: {
        guaranteeAmount: true,
      },
      where: {
        status: 'PLEDGE',
        guaranteeType: 'CASH',
      },
      skip,
      take: take,
    });
  
    const card_pledge = await this.prisma.rent.aggregate({
      _sum: {
        guaranteeAmount: true,
      },
      where: {
        status: 'PLEDGE',
        guaranteeType: 'CARD',
      },
      skip,
      take: take,
    });
  
    const sum = {
      income: +income._sum.amount || 0,
      rentIncome: +rentIncome._sum.amount || 0,
      totalIncome: (+income._sum.amount || 0) + (+rentIncome._sum.amount || 0),
      outcome: +outcome._sum.amount || 0,
      total:
        (+income._sum.amount || 0) +
        (+rentIncome._sum.amount || 0) -
        (+outcome._sum.amount || 0),
      duty: +duty._sum.guaranteeAmount || 0,
      cash_duty: +cash_duty._sum.guaranteeAmount || 0,
      card_duty: +card_duty._sum.guaranteeAmount || 0,
      cash_pledge: +cash_pledge._sum.guaranteeAmount || 0,
      card_pledge: +card_pledge._sum.guaranteeAmount || 0,
    };
  
    return sum;
  } 

  async findIncomeByPersentage() {
    const adminIncome = await this.prisma.income.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        AND: [{ owner: 'ADMIN' }],
      },
    });
    const investorIncome = await this.prisma.income.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        AND: [{ owner: 'INVESTOR' }],
      },
    });
    const partnerIncome = await this.prisma.income.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        AND: [{ owner: 'PARTNER' }],
      },
    });

    const rentIncome = await this.prisma.rent.aggregate({
      _sum: {
        adminIncome: true,
        investorIncome: true,
        partnerIncome: true,
      },
      where: {
        AND: [{ status: 'PAID' }],
      },
    });
    const adminOutcome = await this.prisma.outcome.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        AND: [{ owner: 'ADMIN' }],
      },
    });
    const investorOutcome = await this.prisma.outcome.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        AND: [{ owner: 'INVESTOR' }],
      },
    });
    const partnerOutcome = await this.prisma.outcome.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        AND: [{ owner: 'PARTNER' }],
      },
    });
    return {
      adminIncome:
        +adminIncome._sum.amount +
        rentIncome._sum.adminIncome -
        adminOutcome._sum.amount,
      investorIncome:
        +investorIncome._sum.amount +
        rentIncome._sum.investorIncome -
        investorOutcome._sum.amount,
      partnerIncome:
        +partnerIncome._sum.amount +
        rentIncome._sum.partnerIncome -
        partnerOutcome._sum.amount,
    };
  }

  /*async findHistoryByMonth(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    // Fetching rent, income, and outcome histories
    const rentHistory = await this.prisma.rent.findMany({
      where: {
        AND: [
          { endDate: { gte: startDate } },
          { endDate: { lt: endDate } },
          { OR: [{ status: 'PAID' }, { status: 'DUTY' }] },
        ],
      },
      include: {
        Car: true,
      },
    });

    const incomeHistory = await this.prisma.income.findMany({
      where: {
        AND: [
          { createdAt: { gte: startDate } },
          { createdAt: { lt: endDate } },
        ],
      },
    });

    const outcomeHistory = await this.prisma.outcome.findMany({
      where: {
        AND: [
          { createdAt: { gte: startDate } },
          { createdAt: { lt: endDate } },
        ],
      },
    });

    // Helper function to calculate total income or outcome by role
    const calculateTotalByRole = (history, role, type) => {
      if (type === 'income') {
        return history.reduce((total, item) => {
          if (item.owner === role) {
            return total + (type === 'income' ? item.amount : 0);
          }
          return total;
        }, 0);
      }
      return history.reduce((total, item) => {
        if (item.owner === role) {
          return total + (type === 'outcome' ? item.amount : 0);
        }
        return total;
      }, 0);
    };

    // Helper function to calculate rent income by role
    const calculateRentIncomeByRole = (rentHistory, role) => {
      return rentHistory.reduce((total, rent) => {
        return total + (rent[`${role.toLowerCase()}Income`] || 0);
      }, 0);
    };

    // Grouping data by date
    const groupByDate = (data) => {
      return data.reduce((acc, item) => {
        const dateKey = new Date(item.createdAt || item.endDate)
          .toISOString()
          .split('T')[0];
        if (!acc[dateKey]) {
          acc[dateKey] = { income: 0, outcome: 0, rent: 0, detailed: [] };
        }
        if (item.type === 'income') {
          acc[dateKey].income += item.amount;
        } else if (item.type === 'outcome') {
          acc[dateKey].outcome += item.amount;
        } else if (item.type === 'rent') {
          acc[dateKey].rent += item.amount;
        }
        acc[dateKey].detailed.push(item);
        return acc;
      }, {});
    };

    // Create role-based history entries
    const historyByRole = (role) => {
      const historyIncome = incomeHistory
        .filter((item) => item.owner === role)
        .map((item) => ({ ...item, type: 'income' }));

      const historyOutcome = outcomeHistory
        .filter((item) => item.owner === role)
        .map((item) => ({ ...item, type: 'outcome' }));

      const historyRent = rentHistory.map((item) => {
        const roleIncome = item[`${role.toLowerCase()}Income`] || 0;
        return {
          ...item,
          amount: roleIncome,
          sum: roleIncome,
          type: 'rent',
          createdAt: item.endDate,
        };
      });

      // Combine all history entries
      const combinedHistory = [
        ...historyIncome,
        ...historyRent,
        ...historyOutcome,
      ];

      // Group combined history by date
      const groupedHistory = groupByDate(combinedHistory);

      // Convert grouped history to array format
      const dailySummary = Object.keys(groupedHistory)
        .map((date) => ({
          date,
          ...groupedHistory[date],
        }))
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );

      return {
        dailySummary,
      };
    };

    // Calculate total income and outcome for each role
    const total = {
      admin: {
        income:
          calculateTotalByRole(incomeHistory, 'ADMIN', 'income') +
          calculateRentIncomeByRole(rentHistory, 'ADMIN'),
        outcome: calculateTotalByRole(outcomeHistory, 'ADMIN', 'outcome'),
      },
      investor: {
        income:
          calculateTotalByRole(incomeHistory, 'INVESTOR', 'income') +
          calculateRentIncomeByRole(rentHistory, 'INVESTOR'),
        outcome: calculateTotalByRole(outcomeHistory, 'INVESTOR', 'outcome'),
      },
      partner: {
        income:
          calculateTotalByRole(incomeHistory, 'PARTNER', 'income') +
          calculateRentIncomeByRole(rentHistory, 'PARTNER'),
        outcome: calculateTotalByRole(outcomeHistory, 'PARTNER', 'outcome'),
      },
    };

    // Return the final result with daily summaries for each role
    const history = {
      admin: historyByRole('ADMIN'),
      investor: historyByRole('INVESTOR'),
      partner: historyByRole('PARTNER'),
    };

    return {
      total,
      history,
    };
  }*/

    async findHistory(page: number, pageSize: number) {
      // Validate and calculate pagination parameters
      page = Math.max(page, 1); // Ensure page is at least 1
      pageSize = Math.max(pageSize, 1); // Ensure pageSize is at least 1
      const skip = (page - 1) * pageSize;
      const take = pageSize;
    
      // Fetch total counts for each dataset
      const [rentCount, incomeCount, outcomeCount] = await Promise.all([
        this.prisma.rent.count({
          where: {
            OR: [{ status: 'PAID' }, { status: 'DUTY' }],
          },
        }),
        this.prisma.income.count(),
        this.prisma.outcome.count(),
      ]);
    
      // Determine the total number of pages based on the largest dataset
      const totalRecords = Math.max(rentCount, incomeCount, outcomeCount);
      const totalPages = Math.ceil(totalRecords / pageSize);
    
      // Fetch paginated rent, income, and outcome histories
      const rentHistory = await this.prisma.rent.findMany({
        where: {
          OR: [{ status: 'PAID' }, { status: 'DUTY' }],
        },
        include: {
          Car: true,
        },
        orderBy: { endDate: 'desc' },
        skip,
        take,
      });
    
      const incomeHistory = await this.prisma.income.findMany({
        where: {},
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      });
    
      const outcomeHistory = await this.prisma.outcome.findMany({
        where: {},
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      });
    
      // Helper function to calculate total income or outcome by role
      const calculateTotalByRole = (history, role) =>
        history.reduce((total, item) => (item.owner === role ? total + item.amount : total), 0);
    
      // Helper function to calculate rent income by role
      const calculateRentIncomeByRole = (rentHistory, role) =>
        rentHistory.reduce(
          (total, rent) => total + (rent[`${role.toLowerCase()}Income`] || 0),
          0
        );
    
      // Grouping data by date
      const groupByDate = (data) =>
        data.reduce((acc, item) => {
          const dateKey = new Date(item.createdAt || item.endDate).toISOString().split('T')[0];
          if (!acc[dateKey]) {
            acc[dateKey] = { income: 0, outcome: 0, rent: 0, detailed: [] };
          }
          if (item.type === 'income') {
            acc[dateKey].income += item.amount;
          } else if (item.type === 'outcome') {
            acc[dateKey].outcome += item.amount;
          } else if (item.type === 'rent') {
            acc[dateKey].rent += item.amount;
          }
          acc[dateKey].detailed.push(item);
          return acc;
        }, {});
    
      // Create role-based history entries
      const historyByRole = (role) => {
        const historyIncome = incomeHistory
          .filter((item) => item.owner === role)
          .map((item) => ({ ...item, type: 'income' }));
    
        const historyOutcome = outcomeHistory
          .filter((item) => item.owner === role)
          .map((item) => ({ ...item, type: 'outcome' }));
    
        const historyRent = rentHistory.map((item) => {
          const roleIncome = item[`${role.toLowerCase()}Income`] || 0;
          return {
            ...item,
            amount: roleIncome,
            sum: roleIncome,
            type: 'rent',
            createdAt: item.endDate, // Use endDate as createdAt for rents
          };
        });
    
        // Combine all histories and sort by createdAt
        const combinedHistory = [...historyIncome, ...historyRent, ...historyOutcome].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    
        // Group sorted history by date
        const groupedHistory = groupByDate(combinedHistory);
    
        // Create daily summary
        const dailySummary = Object.keys(groupedHistory)
          .map((date) => ({
            date,
            ...groupedHistory[date],
          }))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
        return {
          dailySummary,
        };
      };
    
      // Calculate total income and outcome for each role
      const total = {
        admin: {
          income:
            calculateTotalByRole(incomeHistory, 'ADMIN') +
            calculateRentIncomeByRole(rentHistory, 'ADMIN'),
          outcome: calculateTotalByRole(outcomeHistory, 'ADMIN'),
        },
        investor: {
          income:
            calculateTotalByRole(incomeHistory, 'INVESTOR') +
            calculateRentIncomeByRole(rentHistory, 'INVESTOR'),
          outcome: calculateTotalByRole(outcomeHistory, 'INVESTOR'),
        },
        partner: {
          income:
            calculateTotalByRole(incomeHistory, 'PARTNER') +
            calculateRentIncomeByRole(rentHistory, 'PARTNER'),
          outcome: calculateTotalByRole(outcomeHistory, 'PARTNER'),
        },
      };
    
      const history = {
        admin: historyByRole('ADMIN'),
        investor: historyByRole('INVESTOR'),
        partner: historyByRole('PARTNER'),
      };
    
      return {
        total,
        history,
        totalPages, // Add totalPages to the response
      };
    }
    
     






    async findRentsByMonth(year: number, month: number) {
      return await this.prisma.rent.count({
        where: {
          AND: [
            { startDate: { gte: new Date(year, month - 1, 1) } },
            { startDate: { lt: new Date(year, month, 1) } },
            { OR: [{ status: 'PAID' }, { status: 'DUTY' }] },
            { isGuaranteeReturned: true},
          ],
        },
      });
    }
  
    async findIncomeByMonth(year: number, month: number) {
  
      const rentIncome = await this.prisma.rent.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          startDate: {
            gte: new Date(year, month - 1, 1), // Дата окончания аренды >= начало текущего месяца
            lt: new Date(year, month, 1), // Дата окончания аренды < начало следующего месяца
          },
          status: {
            in: ['PAID', 'DUTY'], // Статус должен быть 'PAID' или 'DUTY'
          },
          AND: [{ isGuaranteeReturned: true}]
        },
      });
  
      const income = await this.prisma.income.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          AND: [
            { createdAt: { gte: new Date(year, month - 1, 1) } },
            { createdAt: { lt: new Date(year, month, 1) } },
          ],
        },
      });
  
      const outcome = await this.prisma.outcome.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          AND: [
            { createdAt: { gte: new Date(year, month - 1, 1) } },
            { createdAt: { lt: new Date(year, month, 1) } },
          ],
        },
      });
  
      const duty = await this.prisma.rent.aggregate({
        _sum: {
          guaranteeAmount: true,
        },
        where: {
          AND: [{ status: 'DUTY' }],
        },
      });
      const cash_duty = await this.prisma.rent.aggregate({
        _sum: {
          guaranteeAmount: true,
        },
        where: {
          AND: [{ status: 'DUTY' }, { guaranteeType: 'CASH' }],
        },
      });
      const card_duty = await this.prisma.rent.aggregate({
        _sum: {
          guaranteeAmount: true,
        },
        where: {
          AND: [{ status: 'DUTY' }, { guaranteeType: 'CARD' }],
        },
      });
      const cash_pledge = await this.prisma.rent.aggregate({
        _sum: {
          guaranteeAmount: true,
        },
        where: {
          AND: [{ status: 'PLEDGE' }, { guaranteeType: 'CASH' }],
        },
      });
      const card_pledge = await this.prisma.rent.aggregate({
        _sum: {
          guaranteeAmount: true,
        },
        where: {
          AND: [{ status: 'PLEDGE' }, { guaranteeType: 'CARD' }],
        },
      });
      const sum = {
        income: +income._sum.amount,
        rentIncome: +rentIncome._sum.amount,
        totalIncome: +income._sum.amount + rentIncome._sum.amount,
        outcome: +outcome._sum.amount,
        total: income._sum.amount + rentIncome._sum.amount - outcome._sum.amount,
        duty: +duty._sum.guaranteeAmount,
        cash_duty: +cash_duty._sum.guaranteeAmount,
        card_duty: +card_duty._sum.guaranteeAmount,
        cash_pledge: +cash_pledge._sum.guaranteeAmount,
        card_pledge: +card_pledge._sum.guaranteeAmount,
      };
  
      return sum;
    }
}
