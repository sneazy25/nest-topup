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

enum FormType {
    TEXT = 'text',
    NUMBER = 'number',
}

class Form {
    @IsString()
    @IsDefined()
    name: string;

    @IsEnum(FormType)
    @IsDefined()
    type: FormType;
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

    @IsArray()
    @ArrayNotEmpty()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => Form)
    form: any;

    @IsNotEmpty()
    @IsBoolean()
    published: boolean;
}