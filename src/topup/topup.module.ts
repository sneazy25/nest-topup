import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TopupController } from './topup.controller';
import { TopupService } from './topup.service';
import { PrismaService } from '../prisma.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'send-notification',
    }),
    HttpModule],
  controllers: [TopupController],
  providers: [PrismaService, TopupService]
})
export class TopupModule { }
