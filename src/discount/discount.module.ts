import { Module } from '@nestjs/common';
import { DiscountController } from './discount.controller';
import { DiscountService } from './discount.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [DiscountController],
  providers: [PrismaService, DiscountService]
})
export class DiscountModule { }
