"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let ProductService = class ProductService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
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
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException({ status: 'error', message: error.message });
        }
    }
    async getProduct(id) {
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
            });
            if (!find)
                throw new common_1.NotFoundException({ status: 'error', message: 'Product not found.' });
            return {
                status: 'ok',
                data: find,
                message: 'Product retrieved successfully.',
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException({ status: 'error', message: error.message });
        }
    }
    async findProduct(query) {
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
            });
            if (!find)
                throw new common_1.NotFoundException({ status: 'error', message: 'Cannot find the product.' });
            return {
                status: 'ok',
                data: find,
                message: 'Product retrieved successfully.',
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException({ status: 'error', message: error.message });
        }
    }
    async addProduct(createDto) {
        try {
            if (!createDto.slug) {
                let slug = this.slugify(createDto.title);
                let retry = 1;
                while (true) {
                    let check = await this.prisma.product.findFirst({
                        where: {
                            slug: slug
                        }
                    });
                    if (check) {
                        slug = `${slug}-${retry}`;
                        retry++;
                        continue;
                    }
                    else {
                        createDto.slug = slug;
                        break;
                    }
                }
            }
            else {
                let check = await this.prisma.product.findFirst({
                    where: {
                        slug: createDto.slug
                    }
                });
                if (check)
                    throw new common_1.BadRequestException({ status: 'error', message: 'Slug already exist for other product.' });
            }
            await this.checkProductCodes(createDto.variations);
            const categoryOperations = this.categoryOperations(createDto.categories);
            const variationOperations = this.variationOperations(createDto.variations);
            delete createDto.categories;
            delete createDto.variations;
            const form = createDto.form;
            createDto.form = form;
            const create = await this.prisma.product.create({
                data: {
                    ...createDto,
                    categories: {
                        create: categoryOperations,
                    },
                    variations: {
                        create: variationOperations,
                    },
                },
            });
            return {
                status: 'ok',
                data: create,
                message: 'Product created successfully.',
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException({ status: 'error', message: error.message });
        }
    }
    async updateProduct(id, updateDto) {
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
            ]);
            if (!check)
                throw new common_1.NotFoundException({ status: 'error', message: 'Product not found.' });
            if (checkSlug)
                throw new common_1.BadRequestException({ status: 'error', message: 'Slug already exist for other product.' });
            const productId = Number(id);
            await this.checkProductCodes(updateDto.variations, productId);
            const categoryOperations = this.categoryOperations(updateDto.categories);
            const variationOperations = this.variationOperations(updateDto.variations);
            delete updateDto.categories;
            delete updateDto.variations;
            const form = updateDto.form;
            updateDto.form = form;
            const update = await this.prisma.$transaction(async (prisma) => {
                await prisma.product.update({
                    where: { id: productId },
                    data: {
                        categories: {
                            deleteMany: {}
                        },
                        variations: {
                            deleteMany: {}
                        },
                    }
                });
                return await prisma.product.update({
                    where: { id: productId },
                    data: {
                        ...updateDto,
                        categories: {
                            create: categoryOperations,
                        },
                        variations: {
                            create: variationOperations,
                        },
                    }
                });
            });
            return {
                status: 'ok',
                data: update,
                message: 'Product updated successfully.',
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException({ status: 'error', message: error.message });
        }
    }
    async deleteProduct(id) {
        try {
            const productId = Number(id);
            await this.getProduct(productId);
            await Promise.all([
                this.prisma.categoriesOnProducts.deleteMany({
                    where: { productId: productId },
                }),
                this.prisma.variation.deleteMany({
                    where: { productId: productId },
                }),
            ]);
            await this.prisma.product.delete({ where: { id: productId } });
            return {
                status: 'ok',
                data: [],
                message: 'Product deleted successfully.',
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException({ status: 'error', message: error.message });
        }
    }
    categoryOperations(categories) {
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
    variationOperations(variations) {
        return variations.map(variation => ({
            productCode: variation.product_code,
            title: variation.title,
            description: variation.description,
            price: variation.price,
            published: variation.published,
        }));
    }
    async checkProductCodes(variations, productId = null) {
        const productCodes = variations.map(variation => variation.product_code);
        let query;
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
        }
        else {
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
            throw new common_1.BadRequestException({ status: 'error', message: `Product code ${codeJoined} already exist for other product` });
        }
    }
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    slugify(title) {
        title = title.trim().toLowerCase();
        title = title.replaceAll(/\s+/g, '-');
        title = title.replaceAll(/[^0-9a-z-]/g, '');
        return title;
    }
};
exports.ProductService = ProductService;
exports.ProductService = ProductService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductService);
//# sourceMappingURL=product.service.js.map