import { Module } from '@nestjs/common';
// import { PrismaService } from '../prisma.service'; ← sudah dihapus

@Module({
  // providers: [PrismaService], ← hapus ini
})
export class NotificationQueueModule {}
