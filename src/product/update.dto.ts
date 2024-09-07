import { IsNotEmpty, IsString, IsDefined, IsEnum, IsBoolean, IsArray, ArrayNotEmpty, ArrayMinSize, ValidateNested, IsNumber } from 'class-validator';
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

export class UpdateDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsNotEmpty()
    description: string;

    @IsNotEmpty()
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