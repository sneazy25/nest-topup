import { Module } from '@nestjs/common';
import { ExportService } from './export.service';
import { TransactionService } from '../transaction/transaction.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [ExportService, TransactionService],
})
export class ExportModule { }
