import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RefundStatus } from '@prisma/client';
import { createHash } from 'crypto';
import { CreateRefundDto } from './create.dto';
import { ConfigService } from '@nestjs/config';
import { UpdateRefundDto } from './update.dto';

@Injectable()
export class RefundService {
    constructor(
        private prisma: PrismaService,
        private configService: ConfigService
    ) { }

    async create(data: CreateRefundDto): Promise<object> {
        try {
            const _secret = this.configService.get<string>('ENCRYPT_SECRET');
            if (data.signature !== this.hash('sha256', `${data.trxId}${_secret}`)) {
                throw new BadRequestException({ status: 'error', message: 'Invalid signature' });
            }

            const find = await this.prisma.transaction.findUnique({
                where: {
                    trxId: data.trxId,
                },
            });

            if (!find || find.topupStatus !== 'failed') throw new BadRequestException({ status: 'error', message: 'Transaction not found' });

            if (find.updatedAt < new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)) { // Expired in 3 days
                throw new BadRequestException({ status: 'error', message: 'Transaction refund expired' });
            }

            const check = await this.prisma.refund.findFirst({ where: { refId: data.trxId } });
            if (check && check.status === 'success') throw new BadRequestException({ status: 'error', message: 'Refund already completed' });
            if (check) throw new BadRequestException({ status: 'error', message: 'Refund already requested' });

            data['refId'] = data.trxId;
            delete data.trxId;
            delete data.signature;

            const create = await this.prisma.refund.create({
                data: {
                    ...data,
                    status: RefundStatus.pending,
                    transaction: {
                        connect: { trxId: data['refId'] }
                    }
                },
            });

            return {
                status: 'ok',
                message: 'Refund request has been submitted',
                data: create
            }
        } catch (error) {
            throw new InternalServerErrorException({ status: 'error', message: error.message });
        }
    }

    async findAll(): Promise<object> {
        try {
            const find = await this.prisma.refund.findMany({
                include: {
                    transaction: {
                        include: {
                            variation: {
                                select: {
                                    productCode: true
                                }
                            }
                        }
                    }
                }
            });

            return {
                status: 'ok',
                message: 'List of refunds',
                data: find
            }
        } catch (error) {
            throw new InternalServerErrorException({ status: 'error', message: error.message });

        }
    }

    async findOne(id: number): Promise<object> {
        try {
            const find = await this.prisma.refund.findUnique({
                where: {
                    id,
                },
            });

            if (!find) throw new BadRequestException({ status: 'error', message: 'Refund ID not found' });

            return {
                status: 'ok',
                message: 'Refund details',
                data: find
            }
        } catch (error) {
            throw new InternalServerErrorException({ status: 'error', message: error.message });
        }
    }

    async update(id: number, data: UpdateRefundDto): Promise<object> {
        try {
            const find = await this.prisma.refund.findUnique({
                where: {
                    id,
                },
            });

            if (!find) throw new BadRequestException({ status: 'error', message: 'Refund ID not found' });

            data['refId'] = data.trxId;
            delete data.trxId;

            const update = await this.prisma.refund.update({
                where: {
                    id,
                },
                data,
            });

            return {
                status: 'ok',
                message: 'Refund status updated',
                data: update
            }
        } catch (error) {
            throw new InternalServerErrorException({ status: 'error', message: error.message });
        }
    }

    private hash(method: string, data: string): string {
        return createHash(method).update(data).digest('hex')
    }
}
