import { RefundStatus } from '@prisma/client';
export declare class UpdateRefundDto {
    trxId: string;
    merchant: string;
    destination: string;
    status: RefundStatus;
}
