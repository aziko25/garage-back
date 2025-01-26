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
        status: 'PAID',
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
  
    const rentData = await this.prisma.rent.findMany({
      where: {
        status: {
          in: ['PAID'], // Fetch only PAID rents
        },
      },
      include: {
        Rent_Extensions: {
          select: {
            amount: true, // Include only the amount from extensions
          },
        },
      },
      skip,
      take,
    });
    
    // Calculate the total sum
    const totalRentIncome = rentData.reduce((total, rent) => {
      const rentAmount = rent.amount || 0;
      const extensionsAmount = rent.Rent_Extensions.reduce((sum, ext) => sum + (ext.amount || 0), 0);
      return total + rentAmount + extensionsAmount;
    }, 0);
  
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
        isGuaranteeReturned: false,
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
        isGuaranteeReturned: false,
        guaranteeType: 'CARD',
      },
      skip,
      take: take,
    });
  
    const sum = {
      income: +income._sum.amount || 0,
      rentIncome: +totalRentIncome || 0,
      totalIncome: (+income._sum.amount || 0) + (+totalRentIncome || 0),
      outcome: +outcome._sum.amount || 0,
      total:
        (+income._sum.amount || 0) +
        (+totalRentIncome || 0) -
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

    // Fetch rent data with extensions
    const rentsWithExtensions = await this.prisma.rent.findMany({
      where: { status: 'PAID' },
      include: {
        Rent_Extensions: {
          where: { status: 'PAID' },
        },
      },
    });

    // Initialize manual aggregation totals
    let totalAdminRentIncome = 0;
    let totalInvestorRentIncome = 0;
    let totalPartnerRentIncome = 0;

    // Manual aggregation
    rentsWithExtensions.forEach(rent => {
      // Calculate total extension amount
      const totalExtensionAmount = rent.Rent_Extensions.reduce(
        (sum, extension) => sum + (extension.amount || 0),
        0
      );

      // Total amount from rent and extensions
      const totalRentIncome = rent.amount + totalExtensionAmount;

      // Extract percentages from incomePercentage array
      const [adminPercent, investorPercent, partnerPercent] = rent.incomePersentage;

      // Calculate incomes based on percentages
      totalAdminRentIncome += (adminPercent / 100) * totalRentIncome;
      totalInvestorRentIncome += (investorPercent / 100) * totalRentIncome;
      totalPartnerRentIncome += (partnerPercent / 100) * totalRentIncome;
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
        totalAdminRentIncome -
        adminOutcome._sum.amount,
      investorIncome:
        +investorIncome._sum.amount +
        totalInvestorRentIncome -
        investorOutcome._sum.amount,
      partnerIncome:
        +partnerIncome._sum.amount +
        totalPartnerRentIncome -
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
            status: 'PAID',
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
          status: 'PAID' ,
          //isGuaranteeReturned: true,
        },
        include: {
          Car: true,
          Rent_Extensions: {
            where: {
              status: 'PAID',
            },
          },
        },
        orderBy: { endDate: 'desc' },
        skip,
        take,
      });

      rentHistory.forEach(rent => {
       
        // Calculate total extension amount
        const totalExtensionAmount = rent.Rent_Extensions.reduce(
          (sum, extension) => sum + (extension.amount || 0),
          0
        );
        
        // Update the total rent amount
        rent.amount += totalExtensionAmount;
      
        // Extract percentages from incomePercentage array
        const [adminPercent, investorPercent, partnerPercent] = rent.incomePersentage;
      
        // Calculate additional income based on percentages
        const additionalAdminIncome = (adminPercent / 100) * totalExtensionAmount;
        const additionalInvestorIncome = (investorPercent / 100) * totalExtensionAmount;
        const additionalPartnerIncome = (partnerPercent / 100) * totalExtensionAmount;
      
        // Update incomes based on calculated values
        rent.adminIncome += additionalAdminIncome;
        rent.investorIncome += additionalInvestorIncome;
        rent.partnerIncome += additionalPartnerIncome;
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
            { status: 'PAID' },
            //{ isGuaranteeReturned: true},
          ],
        },
      });
    }
  
    async findIncomeByMonth(year: number, month: number) {
      
      const rentIncomeCash = await this.prisma.rent.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          startDate: {
            gte: new Date(year, month - 1, 1),
            lt: new Date(year, month, 1),
          },
          status: {
            in: ['PAID'],
          },
          paymentType: 'CASH', // Добавляем фильтр для наличных
        },
      });

      const rentPaidIncomeCash = await this.prisma.rent.aggregate({
        _sum: {
          amountPaid: true,
        },
        where: {
          startDate: {
            gte: new Date(year, month - 1, 1),
            lt: new Date(year, month, 1),
          },
          status: {
            notIn: ['PAID'],
          },
          paymentType: 'CASH', // Добавляем фильтр для наличных
        },
      });

      const totRentIncomeCash = rentIncomeCash._sum.amount + rentPaidIncomeCash._sum.amountPaid;


    
      const rentIncomeCard = await this.prisma.rent.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          startDate: {
            gte: new Date(year, month - 1, 1),
            lt: new Date(year, month, 1),
          },
          status: {
            in: ['PAID'],
          },
          paymentType: 'CARD', // Добавляем фильтр для карт
        },
      });

      const rentPaidIncomeCard = await this.prisma.rent.aggregate({
        _sum: {
          amountPaid: true,
        },
        where: {
          startDate: {
            gte: new Date(year, month - 1, 1),
            lt: new Date(year, month, 1),
          },
          status: {
            notIn: ['PAID'],
          },
          paymentType: 'CARD', // Добавляем фильтр для карт
        },
      });

      const totRentIncomeCard = rentIncomeCard._sum.amount + rentPaidIncomeCard._sum.amountPaid;


    
      const rentExtensionsIncomeCash = await this.prisma.rent_Extensions.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          createdAt: {
            gte: new Date(year, month - 1, 1),
            lt: new Date(year, month, 1),
          },
          status: {
            in: ['PAID'],
          },
          paymentType: 'CASH', // Добавляем фильтр для наличных
        },
      });

      const rentPaidExtensionsIncomeCash = await this.prisma.rent_Extensions.aggregate({
        _sum: {
          amountPaid: true,
        },
        where: {
          createdAt: {
            gte: new Date(year, month - 1, 1),
            lt: new Date(year, month, 1),
          },
          status: {
            notIn: ['PAID'],
          },
          paymentType: 'CASH', // Добавляем фильтр для наличных
        },
      });

      const totRentExtensionIncomeCash = rentExtensionsIncomeCash._sum.amount + rentPaidExtensionsIncomeCash._sum.amountPaid;


    
      const rentExtensionsIncomeCard = await this.prisma.rent_Extensions.aggregate({
        _sum: {
          amount: true,
        },
        where: {
          createdAt: {
            gte: new Date(year, month - 1, 1),
            lt: new Date(year, month, 1),
          },
          status: {
            in: ['PAID'],
          },
          paymentType: 'CARD', // Добавляем фильтр для карт
        },
      });

      const rentPaidExtensionsIncomeCard = await this.prisma.rent_Extensions.aggregate({
        _sum: {
          amountPaid: true,
        },
        where: {
          createdAt: {
            gte: new Date(year, month - 1, 1),
            lt: new Date(year, month, 1),
          },
          status: {
            notIn: ['PAID'],
          },
          paymentType: 'CARD', // Добавляем фильтр для карт
        },
      });

      const totRentExtensionIncomeCard = rentExtensionsIncomeCard._sum.amount + rentPaidExtensionsIncomeCard._sum.amountPaid;



    
      const totalRentIncomeCash =
        +(totRentIncomeCash || 0) + +(totRentExtensionIncomeCash || 0);
    
      const totalRentIncomeCard =
        +(totRentIncomeCard || 0) + +(totRentExtensionIncomeCard || 0);
    
      const totalRentIncome = totalRentIncomeCash + totalRentIncomeCard;
    
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
          AND: [{ isGuaranteeReturned: false }, { guaranteeType: 'CASH' }],
        },
      });
      const card_pledge = await this.prisma.rent.aggregate({
        _sum: {
          guaranteeAmount: true,
        },
        where: {
          AND: [{ isGuaranteeReturned: false }, { guaranteeType: 'CARD' }],
        },
      });
    
      const sum = {
        income: +income._sum.amount,
        rentIncome: +totalRentIncome,
        rentIncomeCash: +totalRentIncomeCash,
        rentIncomeCard: +totalRentIncomeCard,
        totalIncome: +income._sum.amount + totalRentIncome,
        outcome: +outcome._sum.amount,
        total: income._sum.amount + totalRentIncome - outcome._sum.amount,
        duty: +duty._sum.guaranteeAmount,
        cash_duty: +cash_duty._sum.guaranteeAmount,
        card_duty: +card_duty._sum.guaranteeAmount,
        cash_pledge: +cash_pledge._sum.guaranteeAmount,
        card_pledge: +card_pledge._sum.guaranteeAmount,
      };
    
      return sum;
    }    
}
