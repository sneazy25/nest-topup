import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [PrismaService, NotificationService]
})
export class NotificationModule { }
