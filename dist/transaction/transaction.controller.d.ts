import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './create.dto';
import { ResponseInterface } from './response.interface';
export declare class TransactionController {
    private readonly transactionService;
    constructor(transactionService: TransactionService);
    findAll(search?: string, perPage?: number, page?: number, paymentStatus?: string, topupStatus?: string, startDate?: string, endDate?: string, orderBy?: Prisma.TransactionOrderByWithRelationInput): object;
    check(id: string): object;
    checkPayment(id: string): object;
    create(data: CreateTransactionDto): object;
    update(data: ResponseInterface): object;
    paymentMethod(data: any): object;
    exportXLS(res: Response, search?: string, perPage?: number, page?: number, paymentStatus?: string, topupStatus?: string, startDate?: string, endDate?: string, orderBy?: Prisma.TransactionOrderByWithRelationInput): Promise<void>;
}
