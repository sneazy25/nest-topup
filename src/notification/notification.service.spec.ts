import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from 'src/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';
import { Decimal } from '@prisma/client/runtime/library';
import { PaymentStatus, TopupStatus } from '@prisma/client';

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [NotificationService,
        {
          provide: PrismaService,
          useValue: {
            transaction: {
              findUnique: jest.fn()
            }
          }
        },
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn()
          }
        }
      ],
    }).compile();

    notificationService = module.get<NotificationService>(NotificationService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(notificationService).toBeDefined();
  });

  it('should sendNotification', async () => {
    const mockTransaction = {
      id: 1,
      trxId: 'trxId',
      productId: 3,
      variationId: 1,
      variation: { title: 'variation' },
      customer: [{ id: 'destination', serverId: 'serverId' }],
      refundTo: { id: 'refundToId' },
      duitku: { id: 'duitkuId', paymentMethod: 'BR' },
      apigames: { id: 'apigamesId' },
      amount: new Decimal(10000),
      paymentStatus: PaymentStatus.success,
      topupStatus: TopupStatus.success,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    jest.spyOn(prismaService.transaction, 'findUnique').mockResolvedValue(mockTransaction);
  });
});
