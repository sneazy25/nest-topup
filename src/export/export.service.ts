import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import { TransactionService } from '../transaction/transaction.service';

@Injectable()
export class ExportService {
    constructor(private readonly transactionService: TransactionService) { }

    async exportXLS(
        searchTerm: string | null,
        perPage: number,
        page: number,
        paymentStatus: string | null,
        topupStatus: string | null,
        startDate: Date | null,
        endDate: Date | null,
        orderBy: Prisma.TransactionOrderByWithRelationInput
    ): Promise<any> {
        try {
            const query = await this.transactionService.findAll(searchTerm, perPage, page, paymentStatus, topupStatus, startDate, endDate, orderBy);

            let title = 'Transaction Report';
            if (startDate.toDateString() == endDate.toDateString()) {
                title += ` on ${startDate.toDateString()}`;
            } else {
                if (startDate) title += ` from ${startDate.toDateString()}`;
                if (endDate) title += ` up to ${endDate.toDateString()}`;
            }

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet(title);

            worksheet.columns = [
                { header: 'Transaction ID', key: 'trxId' },
                { header: 'Product', key: 'product' },
                { header: 'Variation', key: 'variation' },
                { header: 'Destination', key: 'destination' },
                { header: 'Amount', key: 'amount' },
                { header: 'Payment Status', key: 'paymentStatus' },
                { header: 'Topup Status', key: 'topupStatus' },
                { header: 'Billed', key: 'createdAt' },
            ];

            for (let i = 0; i < query['data'].length; i++) {
                const createdAt = new Date(query['data'][i]['createdAt']);
                query['data'][i]['product'] = query['data'][i]['product']['title'];
                query['data'][i]['variation'] = query['data'][i]['variation']['productCode'];
                query['data'][i]['createdAt'] = this.readableDate(createdAt);
                query['data'][i]['amount'] = this.formatToIDR(query['data'][i]['amount']);
                query['data'][i]['destination'] = query['data'][i]['customer'][0]['id'];
                if (query['data'][i]['customer'][0]['serverId']) {
                    query['data'][i]['destination'] += `-${query['data'][i]['customer'][0]['serverId']}`;
                }

                worksheet.addRow(
                    query['data'][i]
                )
            }

            const buffer = await workbook.xlsx.writeBuffer();
            return { title, buffer };
        } catch (error) {
            throw new InternalServerErrorException({ status: 'error', message: error.message })
        }
    }

    private readableDate(date: Date): string {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    }

    private formatToIDR(amount: number): string {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(amount);
    }
}
