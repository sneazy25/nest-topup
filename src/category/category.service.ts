import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CategoryService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(): Promise<object> {
        try {
            const find = await this.prisma.category.findMany()

            return {
                status: 'ok',
                data: find,
                message: 'Categories retrieved successfully.',
            }
        } catch (error) {
            throw new InternalServerErrorException({ status: 'error', message: error.message })
        }
    }

    async findProduct(slug: string): Promise<object> {
        try {
            const find = await this.prisma.product.findMany({
                where: {
                    categories: {
                        some: {
                            category: {
                                slug: slug,
                            },
                        },
                    }
                }
            })

            return {
                status: 'ok',
                data: find,
                message: 'Products retrieved successfully.',
            }
        } catch (error) {
            throw new InternalServerErrorException({ status: 'error', message: error.message })
        }
    }
}
