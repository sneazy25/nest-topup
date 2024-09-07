import { Controller, Get, Param } from '@nestjs/common';
import { CategoryService } from './category.service';

@Controller('category')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Get('')
    async getAllCategory() {
        return this.categoryService.findAll()
    }

    @Get('/:slug')
    async findProductByCategory(@Param('slug') slug: string) {
        return this.categoryService.findProduct(slug)
    }
}
