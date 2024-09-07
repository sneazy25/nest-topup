import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from '../prisma.service';
import { TopupQueueModule } from '../job/topup/topup-queue.module';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { DiscountService } from '../discount/discount.service';
import { ExportService } from '../export/export.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'topup-games',
    }),
    HttpModule, ConfigModule, TopupQueueModule],
  exports: [TransactionService],
  controllers: [TransactionController],
  providers: [PrismaService, DiscountService, TransactionService, ExportService]
})
export class TransactionModule { }
