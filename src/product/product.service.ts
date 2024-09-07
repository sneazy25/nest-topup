import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateDto } from './create.dto';
import { UpdateDto } from './update.dto';

@Injectable()
export class ProductService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(): Promise<object> {
        try {
            const find = await this.prisma.product.findMany({
                include: {
                    categories: {
                        include: {
                            category: true
                        },
                    },
                    variations: true
                },
            });

            return {
                status: 'ok',
                data: find,
                message: 'Products retrieved successfully.',
            }
        } catch (error) {
            throw new InternalServerErrorException({ status: 'error', message: error.message })
        }
    }

    async getProduct(id: number): Promise<object> {
        try {
            const find = await this.prisma.product.findUnique({
                where: { id: Number(id) },
                include: {
                    categories: {
                        include: {
                            category: true
                        },
                    },
                    variations: true
                },
            })

            if (!find) throw new NotFoundException({ status: 'error', message: 'Product not found.' })

            return {
                status: 'ok',
                data: find,
                message: 'Product retrieved successfully.',
            }
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error
            } else {
                throw new InternalServerErrorException({ status: 'error', message: error.message })
            }
        }
    }

    async findProduct(query: string): Promise<object> {
        try {
            const find = await this.prisma.product.findMany({
                where: {
                    title: {
                        search: query
                    }
                },
                include: {
                    categories: {
                        include: {
                            category: true
                        },
                    },
                    variations: true
                },
            })

            if (!find) throw new NotFoundException({ status: 'error', message: 'Cannot find the product.' })

            return {
                status: 'ok',
                data: find,
                message: 'Product retrieved successfully.',
            }
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error
            } else {
                throw new InternalServerErrorException({ status: 'error', message: error.message })
            }
        }
    }

    async addProduct(createDto: CreateDto): Promise<object> {
        try {
            if (!createDto.slug) {
                let slug = this.slugify(createDto.title)

                let retry = 1;
                while (true) {
                    let check = await this.prisma.product.findFirst({
                        where: {
                            slug: slug
                        }
                    })

                    if (check) {
                        slug = `${slug}-${retry}`
                        retry++
                        continue
                    } else {
                        createDto.slug = slug
                        break;
                    }
                }
            } else {
                let check = await this.prisma.product.findFirst({
                    where: {
                        slug: createDto.slug
                    }
                })

                if (check) throw new BadRequestException({ status: 'error', message: 'Slug already exist for other product.' })
            }

            await this.checkProductCodes(createDto.variations)
            const categoryOperations = this.categoryOperations(createDto.categories)
            const variationOperations = this.variationOperations(createDto.variations)

            delete createDto.categories
            delete createDto.variations

            const create = await this.prisma.product.create(
                {
                    data: {
                        ...createDto,
                        categories: {
                            create: categoryOperations,
                        },
                        variations: {
                            create: variationOperations,
                        },
                    },
                })

            return {
                status: 'ok',
                data: create,
                message: 'Product created successfully.',
            }
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error
            } else {
                throw new InternalServerErrorException({ status: 'error', message: error.message })
            }
        }
    }

    async updateProduct(id: number, updateDto: UpdateDto): Promise<object> {
        try {
            const [check, checkSlug] = await Promise.all([
                this.prisma.product.findUnique({ where: { id: Number(id) } }),
                this.prisma.product.findFirst({
                    where: {
                        id: {
                            not: Number(id)
                        },
                        slug: updateDto.slug
                    }
                })
            ])

            if (!check) throw new NotFoundException({ status: 'error', message: 'Product not found.' })
            if (checkSlug) throw new BadRequestException({ status: 'error', message: 'Slug already exist for other product.' })

            const productId = Number(id);
            await this.checkProductCodes(updateDto.variations, productId)
            const categoryOperations = this.categoryOperations(updateDto.categories)
            const variationOperations = this.variationOperations(updateDto.variations)

            delete updateDto.categories
            delete updateDto.variations

            const update = await this.prisma.product.update({
                where: { id: productId },
                data: {
                    ...updateDto,
                    categories: {
                        deleteMany: {},
                        create: categoryOperations,
                    },
                    variations: {
                        deleteMany: {},
                        create: variationOperations,
                    },
                },
            });

            return {
                status: 'ok',
                data: update,
                message: 'Product updated successfully.',
            }
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error
            } else {
                throw new InternalServerErrorException({ status: 'error', message: error.message })
            }
        }
    }

    async deleteProduct(id: number): Promise<object> {
        try {
            const productId = Number(id)

            await this.getProduct(productId) // Check if product exist
            await Promise.all([
                this.prisma.categoriesOnProducts.deleteMany({
                    where: { productId: productId },
                }),
                this.prisma.variation.deleteMany({
                    where: { productId: productId },
                }),
            ])
            await this.prisma.product.delete({ where: { id: productId } })

            return {
                status: 'ok',
                data: [],
                message: 'Product deleted successfully.',
            }
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error
            } else {
                throw new InternalServerErrorException({ status: 'error', message: error.message })
            }
        }
    }

    private categoryOperations(categories: string[]): any {
        return categories.map(name => ({
            category: {
                connectOrCreate: {
                    where: {
                        slug: this.slugify(name)
                    },
                    create: {
                        slug: this.slugify(name),
                        name: this.capitalize(name)
                    },
                },
            },
        }));
    }

    private variationOperations(variations: any): any {
        return variations.map(variation => ({
            productCode: variation.product_code,
            title: variation.title,
            description: variation.description,
            price: variation.price,
            published: variation.published,
        }))
    }

    private async checkProductCodes(variations: any, productId: number | null = null): Promise<any> {
        const productCodes = variations.map(variation => variation.product_code);
        let query: object;

        if (productId) {
            query = {
                where: {
                    productId: {
                        not: productId
                    },
                    productCode: {
                        in: productCodes,
                    },
                },
                select: {
                    productCode: true,
                },
            };
        } else {
            query = {
                where: {
                    productCode: {
                        in: productCodes,
                    },
                },
                select: {
                    productCode: true,
                },
            };
        }

        const codeExist = await this.prisma.variation.findMany(query);

        if (codeExist && codeExist.length > 0) {
            const codeJoined = codeExist.map(product => product.productCode).join(', ');
            throw new BadRequestException({ status: 'error', message: `Product code ${codeJoined} already exist for other product` })
        }

        return true;
    }

    private capitalize(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    private slugify(title: string): string {
        title = title.trim().toLowerCase()
        title = title.replaceAll(/\s+/g, '-')
        title = title.replaceAll(/[^0-9a-z-]/g, '')
        return title;
    }
}
