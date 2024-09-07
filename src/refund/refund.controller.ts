import { Controller, Get, Put, Post, Body, Param, UseGuards } from '@nestjs/common';
import { RefundService } from './refund.service';
import { CreateRefundDto } from './create.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('refund')
@UseGuards(AuthGuard)
export class RefundController {
    constructor(private readonly refundService: RefundService) { }

    @Get()
    findAll(): object {
        return this.refundService.findAll();
    }

    @Get('/:id')
    findOne(@Param('id') id: number): object {
        return this.refundService.findOne(id);
    }

    @Post()
    create(@Body() data: CreateRefundDto): object {
        return this.refundService.create(data);
    }

    @Put('/:id')
    update(@Param('id') id: number, @Body() data: any): object {
        return this.refundService.update(id, data);
    }
}
