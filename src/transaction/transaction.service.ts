import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../prisma.service';
import { Prisma, TopupStatus, PaymentStatus } from '@prisma/client';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { firstValueFrom, map, catchError } from 'rxjs';
import { createHash } from 'crypto';
import { DiscountService } from '../discount/discount.service';
import { CreateTransactionDto } from './create.dto';
import { FormInterface } from './form.interface';
import { ResponseInterface } from './response.interface';

@Injectable()
export class TransactionService {
    private duitkuDomain: string;
    private duitkuMerchantCode: string;
    private duitkuApiKey: string;

    constructor(
        private readonly prisma: PrismaService,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        private readonly discount: DiscountService,
        @InjectQueue('topup-games') private readonly topupQueue: Queue
    ) {
        this.duitkuDomain = this.configService.get<string>('DUITKU_DOMAIN');
        this.duitkuMerchantCode = this.configService.get<string>('DUITKU_MERCHANT_CODE');
        this.duitkuApiKey = this.configService.get<string>('DUITKU_API_KEY');
    }

    async findAll(
        searchTerm: string | null,
        perPage: number,
        page: number,
        paymentStatus: string | null,
        topupStatus: string | null,
        startDate: Date | null,
        endDate: Date | null,
        orderBy: Prisma.TransactionOrderByWithRelationInput
    ): Promise<object> {
        try {
            const query = {
                take: perPage,
                skip: (page - 1) * perPage,
                orderBy,
                include: {
                    product: {
                        select: {
                            id: true,
                            title: true,
                        },
                    },
                    variation: {
                        select: {
                            title: true,
                            productCode: true,
                        },
                    },
                    refund: {
                        select: {
                            status: true,
                        }
                    }
                }
            }

            if (searchTerm) {
                query['where'] = {
                    OR: [
                        {
                            trxId: {
                                equals: searchTerm,
                                mode: 'insensitive'
                            }
                        },
                        {
                            customer: {
                                contains: { searchTerm },
                                mode: 'insensitive'
                            }
                        },
                        {
                            duitku: {
                                contains: { searchTerm },
                                mode: 'insensitive'
                            }
                        },
                        {
                            apigames: {
                                contains: { searchTerm },
                                mode: 'insensitive'
                            }
                        },
                        {
                            product: {
                                title: {
                                    constains: searchTerm,
                                    mode: 'insensitive'
                                }
                            }
                        },
                        {
                            variation: {
                                productCode: {
                                    contains: searchTerm,
                                    mode: 'insensitive'
                                }
                            }
                        }
                    ]
                }
            }

            if (paymentStatus) {
                const q = {
                    paymentStatus: {
                        equals: searchTerm
                    }
                }

                if (query['where']) {
                    query['where']['OR'].push(q)
                } else {
                    query['where'] = q
                }
            }

            if (topupStatus) {
                const q = {
                    topupStatus: {
                        equals: searchTerm
                    }
                }

                if (query['where']) {
                    query['where']['OR'].push(q)
                } else {
                    query['where'] = q
                }
            }

            if (startDate && endDate) {
                const q = {
                    createdAt: {
                        gte: startDate,
                        lte: endDate
                    }
                }

                if (query['where']) {
                    query['where']['OR'].push(q)
                } else {
                    query['where'] = q
                }
            } else if (startDate && !endDate) {
                const q = {
                    createdAt: {
                        gte: startDate,
                    }
                }

                if (query['where']) {
                    query['where']['OR'].push(q)
                } else {
                    query['where'] = q
                }
            } else if (!startDate && endDate) {
                const q = {
                    createdAt: {
                        lte: endDate,
                    }
                }

                if (query['where']) {
                    query['where']['OR'].push(q)
                } else {
                    query['where'] = q
                }
            }

            const filter = query['where'] ? query['where'] : {}
            const [transaction, total] = await Promise.all([
                this.prisma.transaction.findMany(query),
                this.prisma.transaction.count(filter),
            ])

            return {
                status: 'ok',
                data: {
                    result: transaction,
                    total: total,
                    page,
                    perPage,
                    totalPages: Math.ceil(total / perPage),
                },
                message: 'Transactions retrieved successfully.',
            }
        } catch (error) {
            throw new InternalServerErrorException({ status: 'error', message: error.message })
        }
    }

    async getInvoice(id: string): Promise<object> {
        try {
            const find = await this.prisma.transaction.findUnique({
                where: { trxId: id },
                include: {
                    product: {
                        select: {
                            id: true,
                            title: true,
                        },
                    },
                    variation: {
                        select: {
                            title: true,
                            productCode: true,
                        },
                    },
                    refund: {
                        select: {
                            status: true,
                        }
                    }
                }
            })

            if (!find) throw new BadRequestException({ status: 'error', message: 'Transaction ID not found.' })

            return {
                status: 'ok',
                data: find,
                message: 'Transaction retrieved successfully.',
            }
        } catch (error) {
            throw new InternalServerErrorException({ status: 'error', message: error.message })
        }
    }

    async checkPayment(id: string): Promise<object> {
        const { duitkuDomain, duitkuMerchantCode, duitkuApiKey, httpService, hash } = this
        try {
            const find = await this.prisma.transaction.findUnique({
                where: { trxId: id }
            })

            if (!find) throw new BadRequestException({ status: 'error', message: 'Transaction ID not found.' })

            const signature = hash('md5', `${duitkuMerchantCode}${id}${duitkuApiKey}`)

            const checkPayment: AxiosResponse<any> = await firstValueFrom(
                httpService.post(`${duitkuDomain}/webapi/api/merchant/transactionStatus`, {
                    merchantcode: duitkuMerchantCode,
                    merchantOrderId: id,
                    signature: signature,
                }).pipe(
                    catchError((error: any) => {
                        let err: string;
                        if (error.response) {
                            err = error.response.data.Message || 'Unknown error'
                        } else if (error.request) {
                            err = 'No response from Duitku server'
                        } else {
                            err = error.message
                        }

                        throw new InternalServerErrorException({ status: 'error', message: err })
                    }),
                )
            )

            return {
                status: 'ok',
                data: checkPayment.data,
                message: 'Payment status checked successfully.',
            }
        } catch (error) {
            throw new InternalServerErrorException({ status: 'error', message: error.message })
        }
    }

    async createInvoice(data: CreateTransactionDto): Promise<object> {
        const prisma = this.prisma;
        const { discount, httpService, configService, duitkuDomain, duitkuMerchantCode, duitkuApiKey } = this;

        try {
            const result = await prisma.$transaction(async (prisma) => {
                let amount: any = data.amount;
                if (data.discountCode) {
                    amount = await discount.useDiscount(data.discountCode, data.productId, data.amount);
                }

                const getPaymentMethod = await this.getPaymentMethod(amount);
                const paymentMethod = getPaymentMethod.map((item: any) => item.paymentMethod);
                if (!paymentMethod.includes(data.paymentMethod)) {
                    throw new BadRequestException({ status: 'error', message: 'Invalid payment method.' });
                }

                const invoiceId = await this.generateInvoiceId();
                const appName = configService.get<string>('APP_NAME');
                const paymentAmount = getPaymentMethod.find((item: any) => item.paymentMethod === data.paymentMethod).amount;
                const signature = this.hash('md5', `${duitkuMerchantCode}${invoiceId}${paymentAmount}${duitkuApiKey}`);

                const createInvoice: AxiosResponse<any> = await firstValueFrom(
                    httpService.post(`${duitkuDomain}/webapi/api/merchant/v2/inquiry`, {
                        merchantcode: duitkuMerchantCode,
                        merchantOrderId: invoiceId,
                        paymentAmount,
                        paymentMethod,
                        productDetails: `Pembayaran untuk ${data.productCode} di toko ${appName}`,
                        email: data.customer.email,
                        customerVaName: data.customer.name,
                        callbackUrl: configService.get<string>('DUITKU_CALLBACK_URL'),
                        returnUrl: data.returnUrl,
                        signature: signature,
                    }).pipe(
                        map((response: AxiosResponse<any>) => {
                            const result = response.data;
                            if (!result || !result.statusCode || result.statusCode !== '00') {
                                throw new InternalServerErrorException({ status: 'error', message: result.statusMessage });
                            }
                            return result;
                        }),
                        catchError((error: any) => {
                            let err: any;
                            if (error.response) {
                                err = error.response.data.Message || 'Unknown error';
                            } else if (error.request) {
                                err = 'No response from Duitku server';
                            } else {
                                err = error.message;
                            }
                            throw new InternalServerErrorException({ status: 'error', message: err });
                        })
                    )
                );

                const duitku = {
                    reference: createInvoice.data.reference,
                    amount: createInvoice.data.amount,
                    paymentMethod: data.paymentMethod,
                    paymentUrl: createInvoice.data.paymentUrl,
                    vaNumber: createInvoice.data.vaNumber,
                    qrString: createInvoice.data.qrString,
                };

                const createParams = {
                    trxId: invoiceId,
                    product: { connect: { id: Number(data.productId) } },
                    variation: { connect: { id: Number(data.productCode) } },
                    amount: Number(amount),
                    customer: data.customer,
                    duitku: duitku,
                    paymentStatus: PaymentStatus.pending,
                    topupStatus: TopupStatus.pending,
                };

                const create = await prisma.transaction.create({ data: createParams });

                return {
                    status: 'ok',
                    data: create,
                    message: 'Transaction created successfully.',
                };
            });

            return result;

        } catch (error) {
            throw new InternalServerErrorException({ status: 'error', message: error.message });
        }
    }

    async updateInvoice(data: ResponseInterface): Promise<object> {
        const prisma = this.prisma;
        const { topupQueue, duitkuMerchantCode, duitkuApiKey, hash } = this;

        try {
            if (!data.merchantCode || !data.merchantOrderId || !data.signature) {
                throw new BadRequestException({ status: 'error', message: 'Invalid request' });
            }

            const signature = hash('md5', `${duitkuMerchantCode}:${duitkuApiKey}:${data.merchantOrderId}`);
            if (signature !== data.signature) {
                throw new BadRequestException({ status: 'error', message: 'Invalid signature' });
            }

            const result = await prisma.$transaction(async (prisma) => {
                const find = await prisma.transaction.findFirst({
                    where: { trxId: data.merchantOrderId },
                    include: { variation: { select: { productCode: true } } }
                });

                if (!find) {
                    throw new BadRequestException({ status: 'error', message: 'Transaction ID not found.' });
                }

                let status: PaymentStatus = data.resultCode === '00' ? PaymentStatus.success : PaymentStatus.failed;

                const update = await prisma.transaction.update({
                    where: { trxId: data.merchantOrderId },
                    data: {
                        paymentStatus: status,
                        duitku: JSON.parse(JSON.stringify(data))
                    }
                });

                if (status === PaymentStatus.success) {
                    await topupQueue.add('topup', { topupData: find });
                }

                return {
                    status: 'ok',
                    data: update,
                    message: 'Transaction updated successfully.',
                };
            });

            return result;

        } catch (error) {
            throw new InternalServerErrorException({ status: 'error', message: error.message });
        }
    }

    async getPaymentMethod(amount: number): Promise<any> {
        const { httpService, duitkuDomain, duitkuMerchantCode, duitkuApiKey, hash, padZero } = this;
        try {
            const now = new Date()
            const year = now.getFullYear()
            const month = padZero(now.getMonth() + 1)
            const day = padZero(now.getDate())
            const hours = padZero(now.getHours())
            const minutes = padZero(now.getMinutes())
            const seconds = padZero(now.getSeconds())
            const datetime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`

            const signature = hash('sha256', `${duitkuMerchantCode}${amount}${datetime}${duitkuApiKey}`)

            const getPayment: AxiosResponse<any> = await firstValueFrom(
                httpService.post(`${duitkuDomain}/webapi/api/merchant/paymentmethod/getpaymentmethod`, {
                    merchantcode: duitkuMerchantCode,
                    amount: amount,
                    datetime: datetime,
                    signature: signature,
                }).pipe(
                    map((response: AxiosResponse<any>) => {
                        const result = response.data
                        if (!result || !result.responseCode || result.responseCode !== '00') {
                            throw new InternalServerErrorException({ status: 'error', message: result.responseMessage })
                        }
                        return result
                    }),
                    catchError((error: any) => {
                        let err: any;
                        if (error.response) {
                            err = error.response.data.Message || 'Unknown error'
                        } else if (error.request) {
                            err = 'No response from Duitku server'
                        } else {
                            err = error.message
                        }

                        throw new InternalServerErrorException({ status: 'error', message: err })
                    }),
                )
            )

            return getPayment.data.paymentFee
        } catch (error) {
            throw new InternalServerErrorException({ status: 'error', message: error.message })
        }
    }

    private async generateInvoiceId(): Promise<string> {
        while (true) {
            const uniqueID = await this.createUniqueID()
            const check = await this.prisma.transaction.findUnique({ where: { trxId: uniqueID } })
            if (!check) return uniqueID
        }
    }

    private async createUniqueID(): Promise<string> {
        const length = Math.floor(Math.random() * (12 - 8 + 1)) + 8;
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = 'T';

        const timestamp = Date.now().toString(36);
        result += timestamp.slice(-4).toUpperCase();

        for (let i = result.length; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            result += characters[randomIndex];
        }

        return result;
    }

    private hash(method: string, data: string): string {
        return createHash(method).update(data).digest('hex')
    }

    private padZero(num: number): string | number {
        return num < 10 ? '0' + num : num
    }
}
