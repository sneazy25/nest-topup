import { Module } from '@nestjs/common';
import { RefundController } from './refund.controller';
import { RefundService } from './refund.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [RefundController],
  providers: [PrismaService, RefundService]
})
export class RefundModule { }
