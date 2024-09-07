import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { ExportService } from './export.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { PrismaService } from 'src/prisma.service';
import { HttpModule } from '@nestjs/axios';
import { TransactionModule } from 'src/transaction/transaction.module';

describe('ExportService', () => {
  let exportService: ExportService;
  let transactionService: TransactionService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, TransactionModule],
      providers: [
        {
          provide: ExportService,
          useValue: {
            exportXLS: jest.fn(),
          },
        },
        {
          provide: TransactionService,
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    exportService = module.get<ExportService>(ExportService);
    transactionService = module.get<TransactionService>(TransactionService);
  });

  it('should be defined', () => {
    expect(exportService).toBeDefined();
  });

  it('should exportXLS', async () => {
    const searchTerm = 'searchTerm';
    const perPage = 10;
    const page = 1;
    const paymentStatus = 'paymentStatus';
    const topupStatus = 'topupStatus';
    const startDate = new Date();
    const endDate = new Date();
    const orderBy = { updatedAt: 'asc' } as Prisma.TransactionOrderByWithRelationInput;

    const mockQuery = {
      data: [
        {
          trxId: 'trxId',
          product: { title: 'product' },
          variation: { productCode: 'variation' },
          customer: [{ id: 'destination', serverId: 'serverId' }],
          amount: 10000,
          paymentStatus: 'paymentStatus',
          topupStatus: 'topupStatus',
          createdAt: new Date(),
        },
      ],
    };

    jest.spyOn(transactionService, 'findAll').mockResolvedValue(mockQuery);

    const result = await exportService.exportXLS(
      searchTerm,
      perPage,
      page,
      paymentStatus,
      topupStatus,
      startDate,
      endDate,
      orderBy,
    );

    expect(result).toBeDefined();
  });
});
