import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateDiscountDto } from './create.dto';
import { UpdateDiscountDto } from './update.dto';

@Injectable()
export class DiscountService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(): Promise<object> {
        try {
            const find = await this.prisma.discount.findMany()
            return {
                status: 'ok',
                data: find,
                message: 'Discounts retrieved successfully.',
            }
        } catch (error) {
            throw new InternalServerErrorException({ status: 'error', message: error.message })
        }
    }

    async getDiscount(id: number): Promise<object> {
        try {
            const find = await this.prisma.discount.findUnique({
                where: { id: Number(id) }
            })

            if (!find) throw new BadRequestException({ status: 'error', message: 'Discount ID not found.' });

            return {
                status: 'ok',
                data: find,
                message: 'Discount retrieved successfully.',
            }
        } catch (error) {
            throw new InternalServerErrorException({ status: 'error', message: error.message })
        }
    }

    async getDiscountByProduct(productId: number): Promise<object> {
        try {
            const find = await this.prisma.discount.findMany({
                where: {
                    productId: Number(productId)
                }
            })

            if (!find) throw new BadRequestException({ status: 'error', message: 'Discount for provided product not found.' });

            return {
                status: 'ok',
                data: find,
                message: 'Discount retrieved successfully.',
            }
        } catch (error) {
            throw new InternalServerErrorException({ status: 'error', message: error.message })
        }
    }

    async createDiscount(createDto: CreateDiscountDto): Promise<object> {
        try {
            const checkDiscountType = await this.checkDiscountType(createDto)
            const data = checkDiscountType

            const [checkProduct, checkCode] = await Promise.all([
                this.prisma.product.findFirst({ where: { id: data.productId } }),
                this.prisma.discount.findFirst({ where: { discountCode: data.discountCode } }),
            ])

            if (!checkProduct) throw new BadRequestException({ status: 'error', message: 'Product ID not found.' });
            if (checkCode) throw new BadRequestException({ status: 'error', message: 'Discount code already added.' });

            if (data.startDate) data.startDate = new Date(data.startDate)
            if (data.endDate) data.endDate = new Date(data.endDate)

            const create = await this.prisma.discount.create({ data })

            return {
                'status': 'ok',
                'data': create,
                'message': 'Discount created successfully.'
            }
        } catch (error) {
            throw new InternalServerErrorException({ status: 'error', message: error.message })
        }
    }

    async updateDiscount(id: number, updateDto: UpdateDiscountDto): Promise<object> {
        try {
            const checkDiscountType = await this.checkDiscountType(updateDto)
            const data = checkDiscountType

            const [checkProduct, checkDiscountId, checkCode] = await Promise.all([
                this.prisma.product.findFirst({ where: { id: data.productId } }),
                this.prisma.discount.findUnique({ where: { id: Number(id) } }),
                this.prisma.discount.findFirst({
                    where: {
                        id: { not: Number(id) },
                        discountCode: data.discountCode
                    }
                }),
            ])

            if (!checkDiscountId) throw new BadRequestException({ status: 'error', message: 'Discount not found.' });
            if (!checkProduct) throw new BadRequestException({ status: 'error', message: 'Product ID not found.' });
            if (checkCode) throw new BadRequestException({ status: 'error', message: 'Discount code already added.' });

            data.startDate = (data.startDate) ? new Date(data.startDate) : null
            data.endDate = (data.endDate) ? new Date(data.endDate) : null
            if (!data.productId) data.productId = null
            if (!data.minPrice) data.minPrice = null
            if (!data.maxPrice) data.maxPrice = null

            const update = await this.prisma.discount.update({
                where: { id: Number(id) },
                data
            })

            return {
                'status': 'ok',
                'data': update,
                'message': 'Discount updated successfully.'
            }
        } catch (error) {
            throw new InternalServerErrorException({ status: 'error', message: error.message })
        }
    }

    async deleteDiscount(id: number): Promise<object> {
        try {
            const check = await this.prisma.discount.findUnique({ where: { id: Number(id) } })
            if (!check) throw new BadRequestException({ status: 'error', message: 'Discount ID not found.' });

            await this.prisma.discount.delete({
                where: { id: Number(id) }
            })

            return {
                'status': 'ok',
                'data': [],
                'message': 'Discount deleted successfully.'
            }
        } catch (error) {
            throw new InternalServerErrorException({ status: 'error', message: error.message })
        }
    }

    async useDiscount(discountCode: string, productId: number, amount: number): Promise<number | object> {
        try {
            const discount = await this.prisma.discount.findFirst({ where: { discountCode: discountCode } })

            if (!discount) throw new BadRequestException({ status: 'error', message: 'Invalid discount code.' })

            if (discount.productId && discount.productId !== productId) {
                throw new BadRequestException({ status: 'error', message: 'Discount code not valid for this product.' })
            }

            if (discount.startDate && discount.startDate > new Date()) {
                throw new BadRequestException({ status: 'error', message: 'Discount code not yet valid.' })
            }

            if (discount.endDate && discount.endDate < new Date()) {
                throw new BadRequestException({ status: 'error', message: 'Discount code has expired.' })
            }

            if (discount.minPrice && amount < Number(discount.minPrice)) {
                throw new BadRequestException({ status: 'error', message: 'Minimum purchase amount not reached.' })
            }

            if (discount.maxPrice && amount > Number(discount.maxPrice)) {
                throw new BadRequestException({ status: 'error', message: 'Maximum purchase amount exceeded.' })
            }

            if (discount.limit && discount.limit <= discount.usage) {
                throw new BadRequestException({ status: 'error', message: 'Discount code has reached its limit.' })
            }

            if (discount.type === 'percentage') {
                amount = Number(amount) - (Number(amount) * (Number(discount.percentage) / 100))
            } else {
                amount = amount - Number(discount.priceReduce)
            }

            await this.prisma.discount.update({
                where: { discountCode },
                data: {
                    usage: discount.usage + 1
                }
            })

            return amount
        } catch (error) {
            throw new InternalServerErrorException({ status: 'error', message: error.message })

        }
    }

    private checkDiscountType(formDto: any): any {
        if (formDto.type === 'percentage') {
            if (formDto.priceReduce !== null) {
                throw new BadRequestException({ status: 'error', message: 'Price reduce should not be provided for percentage discount.' });
            }
            if (formDto.percentage === null) {
                throw new BadRequestException({ status: 'error', message: 'Percentage must be provided for percentage discount.' });
            }
            formDto.priceReduce = null
        } else if (formDto.type === 'priceReduce') {
            if (formDto.percentage !== null) {
                throw new BadRequestException({ status: 'error', message: 'Percentage should not be provided for price reduce discount.' });
            }
            if (formDto.priceReduce === null) {
                throw new BadRequestException({ status: 'error', message: 'Price reduce must be provided for price reduce discount.' });
            }
            formDto.percentage = null
        }
        return formDto
    }
}
