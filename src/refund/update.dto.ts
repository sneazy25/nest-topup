import { RefundStatus } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';
export class UpdateRefundDto {
    @IsNotEmpty()
    @IsString()
    trxId: string;

    @IsNotEmpty()
    @IsString()
    merchant: string;

    @IsNotEmpty()
    @IsString()
    destination: string;

    @IsNotEmpty()
    @IsString()
    status: RefundStatus;
}