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
exports.DiscountService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let DiscountService = class DiscountService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        try {
            const find = await this.prisma.discount.findMany();
            return {
                status: 'ok',
                data: find,
                message: 'Discounts retrieved successfully.',
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException({ status: 'error', message: error.message });
        }
    }
    async getDiscount(id) {
        try {
            const find = await this.prisma.discount.findUnique({
                where: { id: Number(id) }
            });
            if (!find)
                throw new common_1.BadRequestException({ status: 'error', message: 'Discount ID not found.' });
            return {
                status: 'ok',
                data: find,
                message: 'Discount retrieved successfully.',
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException({ status: 'error', message: error.message });
        }
    }
    async getDiscountByProduct(productId) {
        try {
            const find = await this.prisma.discount.findMany({
                where: {
                    productId: Number(productId)
                }
            });
            if (!find)
                throw new common_1.BadRequestException({ status: 'error', message: 'Discount for provided product not found.' });
            return {
                status: 'ok',
                data: find,
                message: 'Discount retrieved successfully.',
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException({ status: 'error', message: error.message });
        }
    }
    async createDiscount(createDto) {
        try {
            const checkDiscountType = await this.checkDiscountType(createDto);
            const data = checkDiscountType;
            const [checkProduct, checkCode] = await Promise.all([
                this.prisma.product.findFirst({ where: { id: data.productId } }),
                this.prisma.discount.findFirst({ where: { discountCode: data.discountCode } }),
            ]);
            if (!checkProduct)
                throw new common_1.BadRequestException({ status: 'error', message: 'Product ID not found.' });
            if (checkCode)
                throw new common_1.BadRequestException({ status: 'error', message: 'Discount code already added.' });
            if (data.startDate)
                data.startDate = new Date(data.startDate);
            if (data.endDate)
                data.endDate = new Date(data.endDate);
            const create = await this.prisma.discount.create({ data });
            return {
                'status': 'ok',
                'data': create,
                'message': 'Discount created successfully.'
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException({ status: 'error', message: error.message });
        }
    }
    async updateDiscount(id, updateDto) {
        try {
            const checkDiscountType = await this.checkDiscountType(updateDto);
            const data = checkDiscountType;
            const [checkProduct, checkDiscountId, checkCode] = await Promise.all([
                this.prisma.product.findFirst({ where: { id: data.productId } }),
                this.prisma.discount.findUnique({ where: { id: Number(id) } }),
                this.prisma.discount.findFirst({
                    where: {
                        id: { not: Number(id) },
                        discountCode: data.discountCode
                    }
                }),
            ]);
            if (!checkDiscountId)
                throw new common_1.BadRequestException({ status: 'error', message: 'Discount not found.' });
            if (!checkProduct)
                throw new common_1.BadRequestException({ status: 'error', message: 'Product ID not found.' });
            if (checkCode)
                throw new common_1.BadRequestException({ status: 'error', message: 'Discount code already added.' });
            data.startDate = (data.startDate) ? new Date(data.startDate) : null;
            data.endDate = (data.endDate) ? new Date(data.endDate) : null;
            if (!data.productId)
                data.productId = null;
            if (!data.minPrice)
                data.minPrice = null;
            if (!data.maxPrice)
                data.maxPrice = null;
            const update = await this.prisma.discount.update({
                where: { id: Number(id) },
                data
            });
            return {
                'status': 'ok',
                'data': update,
                'message': 'Discount updated successfully.'
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException({ status: 'error', message: error.message });
        }
    }
    async deleteDiscount(id) {
        try {
            const check = await this.prisma.discount.findUnique({ where: { id: Number(id) } });
            if (!check)
                throw new common_1.BadRequestException({ status: 'error', message: 'Discount not found.' });
            await this.prisma.discount.delete({
                where: { id: Number(id) }
            });
            return {
                'status': 'ok',
                'data': [],
                'message': 'Discount deleted successfully.'
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException({ status: 'error', message: error.message });
        }
    }
    async useDiscount(discountCode, productId, amount) {
        const discount = await this.prisma.discount.findFirst({ where: { discountCode: discountCode } });
        if (!discount)
            throw new common_1.BadRequestException({ status: 'error', message: 'Invalid discount code.' });
        if (discount.productId && discount.productId !== productId) {
            throw new common_1.BadRequestException({ status: 'error', message: 'Discount code not valid for this product.' });
        }
        if (discount.startDate && discount.startDate > new Date()) {
            throw new common_1.BadRequestException({ status: 'error', message: 'Discount code not yet valid.' });
        }
        if (discount.endDate && discount.endDate < new Date()) {
            throw new common_1.BadRequestException({ status: 'error', message: 'Discount code has expired.' });
        }
        if (discount.minPrice && amount < Number(discount.minPrice)) {
            throw new common_1.BadRequestException({ status: 'error', message: 'Minimum purchase amount not reached.' });
        }
        if (discount.maxPrice && amount > Number(discount.maxPrice)) {
            throw new common_1.BadRequestException({ status: 'error', message: 'Maximum purchase amount exceeded.' });
        }
        if (discount.limit && discount.limit <= discount.usage) {
            throw new common_1.BadRequestException({ status: 'error', message: 'Discount code has reached its limit.' });
        }
        if (discount.type === 'percentage') {
            amount = Number(amount) - (Number(amount) * (Number(discount.percentage) / 100));
        }
        else {
            amount = amount - Number(discount.priceReduce);
        }
        return amount;
    }
    checkDiscountType(formDto) {
        if (formDto.type === 'percentage') {
            if (formDto.priceReduce !== undefined) {
                throw new common_1.BadRequestException({ status: 'error', message: 'Price reduce should not be provided for percentage discount.' });
            }
            if (formDto.percentage === undefined) {
                throw new common_1.BadRequestException({ status: 'error', message: 'Percentage must be provided for percentage discount.' });
            }
            formDto.priceReduce = null;
        }
        else if (formDto.type === 'priceReduce') {
            if (formDto.percentage !== undefined) {
                throw new common_1.BadRequestException({ status: 'error', message: 'Percentage should not be provided for price reduce discount.' });
            }
            if (formDto.priceReduce === undefined) {
                throw new common_1.BadRequestException({ status: 'error', message: 'Price reduce must be provided for price reduce discount.' });
            }
            formDto.percentage = null;
        }
        return formDto;
    }
};
exports.DiscountService = DiscountService;
exports.DiscountService = DiscountService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DiscountService);
//# sourceMappingURL=discount.service.js.map