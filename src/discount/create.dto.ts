import { IsNotEmpty, IsString, IsOptional, IsEnum, IsNumber, Min, Max, IsBoolean, IsDateString, ValidateIf } from 'class-validator';
import { IsTodayOrAfter } from '../decorator/IsTodayOrAfter';

enum DiscountType {
    TEXT = 'percentage',
    NUMBER = 'price_reduce',
}

export class CreateDiscountDto {
    @IsNotEmpty()
    @IsString()
    discountCode: string;

    @IsOptional()
    @IsNumber()
    productId: number;

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    minPrice: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    maxPrice: number;

    @IsOptional()
    @IsDateString()
    @IsTodayOrAfter()
    startDate: Date;

    @IsOptional()
    @IsDateString()
    @IsTodayOrAfter()
    endDate: Date;

    @IsOptional()
    @IsNumber()
    @Min(1)
    limit: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    usage: number;

    @IsNotEmpty()
    @IsEnum(DiscountType)
    type: any;

    @ValidateIf(o => o.type === 'percentage')
    @IsNotEmpty()
    @IsNumber()
    @Max(100)
    percentage: number;

    @ValidateIf(o => o.type === 'price_reduce')
    @IsNotEmpty()
    @IsNumber()
    priceReduce: number;

    @IsNotEmpty()
    @IsBoolean()
    published: boolean;
}