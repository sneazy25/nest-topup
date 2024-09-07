import { IsNotEmpty, IsString, IsOptional, IsDefined, IsEnum, IsNumber, IsBoolean, IsArray, ArrayNotEmpty, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class Variation {
    @IsString()
    @IsDefined()
    product_code: string;

    @IsString()
    @IsDefined()
    title: string;

    @IsString()
    @IsDefined()
    description: string;

    @IsNumber()
    @IsDefined()
    price: number;

    @IsBoolean()
    @IsDefined()
    published: boolean;
}

export class CreateDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    description: string;

    @IsOptional()
    @IsString()
    slug: string;

    @IsNotEmpty()
    poster: string;

    @IsArray()
    @ArrayNotEmpty()
    @Type(() => String)
    categories: string[];

    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => Variation)
    variations: Variation;

    @IsNotEmpty()
    @IsBoolean()
    published: boolean;
}