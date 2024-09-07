import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { DiscountService } from './discount.service';
import { CreateDiscountDto } from './create.dto';
import { UpdateDiscountDto } from './update.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('discount')
@UseGuards(AuthGuard)
export class DiscountController {
    constructor(private readonly discountService: DiscountService) { }

    @Get('')
    getAllDiscount(): object {
        return this.discountService.findAll();
    }

    @Get('product/:id')
    getDiscountByProduct(@Param('id') id: number): object {
        return this.discountService.getDiscountByProduct(id);
    }

    @Get('/:id')
    getDiscount(@Param('id') id: number): object {
        return this.discountService.getDiscount(id);
    }

    @Post('')
    createDiscount(@Body() create: CreateDiscountDto): object {
        return this.discountService.createDiscount(create);
    }

    @Put('/:id')
    updateDiscount(@Param('id') id: number, @Body() update: UpdateDiscountDto): object {
        return this.discountService.updateDiscount(id, update);
    }

    @Delete('/:id')
    deleteDiscount(@Param('id') id: number): object {
        return this.discountService.deleteDiscount(id);
    }
}
