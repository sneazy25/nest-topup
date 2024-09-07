import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateDto } from './create.dto';
import { UpdateDto } from './update.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('product')
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    @Get('')
    getAllProduct(): object {
        return this.productService.findAll()
    }

    @Get('/search/:query')
    findProduct(@Param('query') query: string): object {
        return this.productService.findProduct(query)
    }

    @Get('/:id')
    getProduct(@Param('id') id: number): object {
        return this.productService.getProduct(id)
    }

    @UseGuards(AuthGuard)
    @Post('')
    async addProduct(@Body() create: CreateDto): Promise<object> {
        return this.productService.addProduct(create)
    }

    @UseGuards(AuthGuard)
    @Put('/:id')
    updateProduct(@Param('id') id: number, @Body() update: UpdateDto): object {
        return this.productService.updateProduct(id, update)
    }

    @UseGuards(AuthGuard)
    @Delete('/:id')
    destroyProduct(@Param('id') id: number): object {
        return this.productService.deleteProduct(id)
    }
}
