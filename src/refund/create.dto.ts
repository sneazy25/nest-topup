import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRefundDto {
    @IsNotEmpty()
    @IsString()
    signature: string;

    @IsNotEmpty()
    @IsString()
    trxId: string;

    @IsNotEmpty()
    @IsString()
    merchant: string;

    @IsNotEmpty()
    @IsString()
    destination: string;
}