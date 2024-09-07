import { Controller, Get, Post, Body, Param, Query, Res, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { ExportService } from '../export/export.service';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './create.dto';
import { ResponseInterface } from './response.interface';

@Controller('transaction')
export class TransactionController {
    constructor(
        private readonly transactionService: TransactionService,
        private readonly exportService: ExportService,
    ) { }

    @Get()
    findAll(
        @Query('search') search?: string,
        @Query('perPage') perPage?: number,
        @Query('page') page?: number,
        @Query('paymentStatus') paymentStatus?: string,
        @Query('topupStatus') topupStatus?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('orderBy') orderBy?: Prisma.TransactionOrderByWithRelationInput,
    ): object {
        search = search ? search : null;
        perPage = perPage ? perPage : 10;
        page = page ? page : 1;
        paymentStatus = paymentStatus ? paymentStatus : null;
        topupStatus = topupStatus ? topupStatus : null;
        const sD = startDate ? new Date(startDate) : null;
        const eD = endDate ? new Date(endDate) : null;
        orderBy = orderBy ? orderBy : { updatedAt: 'desc' };

        return this.transactionService.findAll(search, perPage, page, paymentStatus, topupStatus, sD, eD, orderBy);
    }

    @Get('check:/trxId')
    check(@Param('trxId') id: string): object {
        return this.transactionService.getInvoice(id);
    }

    @Get('check-payment:/trxId')
    checkPayment(@Param('trxId') id: string): object {
        return this.transactionService.checkPayment(id);
    }

    @Post('create')
    create(@Body() data: CreateTransactionDto): object {
        return this.transactionService.createInvoice(data);
    }

    @Post('update')
    update(@Body() data: ResponseInterface): object {
        return this.transactionService.updateInvoice(data);
    }

    @Post('payment-method')
    paymentMethod(@Body() data: any): object {
        if (!data.amount) throw new BadRequestException({ status: 'error', message: 'Amount parameter is required' });
        return this.transactionService.getPaymentMethod(data.amount);
    }

    @Get('export')
    async exportXLS(
        @Res() res: Response,
        @Query('search') search?: string,
        @Query('perPage') perPage?: number,
        @Query('page') page?: number,
        @Query('paymentStatus') paymentStatus?: string,
        @Query('topupStatus') topupStatus?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('orderBy') orderBy?: Prisma.TransactionOrderByWithRelationInput,
    ) {
        search = search ? search : null;
        perPage = perPage ? perPage : 10;
        page = page ? page : 1;
        paymentStatus = paymentStatus ? paymentStatus : null;
        topupStatus = topupStatus ? topupStatus : null;
        const sD = startDate ? new Date(startDate) : null;
        const eD = endDate ? new Date(endDate) : null;
        orderBy = orderBy ? orderBy : { updatedAt: 'desc' };

        const data = await this.exportService.exportXLS(search, perPage, page, paymentStatus, topupStatus, sD, eD, orderBy);

        res.header('Content-Disposition', `attachment; filename=${data.title}.xlsx`);
        res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(data.buffer);
    }
}
