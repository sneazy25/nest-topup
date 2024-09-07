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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bull_1 = require("@nestjs/bull");
const prisma_service_1 = require("../prisma.service");
const client_1 = require("@prisma/client");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const crypto_1 = require("crypto");
const ExcelJS = require("exceljs");
const discount_service_1 = require("../discount/discount.service");
let TransactionService = class TransactionService {
    constructor(prisma, httpService, configService, discount, topupQueue) {
        this.prisma = prisma;
        this.httpService = httpService;
        this.configService = configService;
        this.discount = discount;
        this.topupQueue = topupQueue;
        this.duitkuDomain = this.configService.get('DUITKU_DOMAIN');
        this.duitkuMerchantCode = this.configService.get('DUITKU_MERCHANT_CODE');
        this.duitkuApiKey = this.configService.get('DUITKU_API_KEY');
    }
    async findAll(searchTerm, perPage, page, paymentStatus, topupStatus, startDate, endDate, orderBy) {
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
            };
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
                };
            }
            if (paymentStatus) {
                const q = {
                    paymentStatus: {
                        equals: searchTerm
                    }
                };
                if (query['where']) {
                    query['where']['OR'].push(q);
                }
                else {
                    query['where'] = q;
                }
            }
            if (topupStatus) {
                const q = {
                    topupStatus: {
                        equals: searchTerm
                    }
                };
                if (query['where']) {
                    query['where']['OR'].push(q);
                }
                else {
                    query['where'] = q;
                }
            }
            if (startDate && endDate) {
                const q = {
                    createdAt: {
                        gte: startDate,
                        lte: endDate
                    }
                };
                if (query['where']) {
                    query['where']['OR'].push(q);
                }
                else {
                    query['where'] = q;
                }
            }
            else if (startDate && !endDate) {
                const q = {
                    createdAt: {
                        gte: startDate,
                    }
                };
                if (query['where']) {
                    query['where']['OR'].push(q);
                }
                else {
                    query['where'] = q;
                }
            }
            else if (!startDate && endDate) {
                const q = {
                    createdAt: {
                        lte: endDate,
                    }
                };
                if (query['where']) {
                    query['where']['OR'].push(q);
                }
                else {
                    query['where'] = q;
                }
            }
            const filter = query['where'] ? query['where'] : {};
            const [transaction, total] = await Promise.all([
                this.prisma.transaction.findMany(query),
                this.prisma.transaction.count(filter),
            ]);
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
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException({ status: 'error', message: error.message });
        }
    }
    async getInvoice(id) {
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
            });
            if (!find)
                throw new common_1.BadRequestException({ status: 'error', message: 'Transaction ID not found.' });
            return {
                status: 'ok',
                data: find,
                message: 'Transaction retrieved successfully.',
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException({ status: 'error', message: error.message });
        }
    }
    async checkPayment(id) {
        const { duitkuDomain, duitkuMerchantCode, duitkuApiKey, httpService, hash } = this;
        try {
            const find = await this.prisma.transaction.findUnique({
                where: { trxId: id }
            });
            if (!find)
                throw new common_1.BadRequestException({ status: 'error', message: 'Transaction ID not found.' });
            const signature = hash('md5', `${duitkuMerchantCode}${id}${duitkuApiKey}`);
            const checkPayment = await (0, rxjs_1.firstValueFrom)(httpService.post(`${duitkuDomain}/webapi/api/merchant/transactionStatus`, {
                merchantcode: duitkuMerchantCode,
                merchantOrderId: id,
                signature: signature,
            }).pipe((0, rxjs_1.catchError)((error) => {
                let err;
                if (error.response) {
                    err = error.response.data.Message || 'Unknown error';
                }
                else if (error.request) {
                    err = 'No response from Duitku server';
                }
                else {
                    err = error.message;
                }
                throw new common_1.InternalServerErrorException({ status: 'error', message: err });
            })));
            return {
                status: 'ok',
                data: checkPayment.data,
                message: 'Payment status checked successfully.',
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException({ status: 'error', message: error.message });
        }
    }
    async createInvoice(data) {
        const prisma = this.prisma;
        const { discount, httpService, configService, duitkuDomain, duitkuMerchantCode, duitkuApiKey } = this;
        try {
            const result = await prisma.$transaction(async (prisma) => {
                await this.checkCustomer(Number(data.productId), data.customer);
                let amount;
                if (data.discountCode) {
                    amount = await discount.useDiscount(data.discountCode, data.productId, data.amount);
                }
                const getPaymentMethod = await this.getPaymentMethod(amount);
                const paymentMethod = getPaymentMethod.map((item) => item.paymentMethod);
                if (!paymentMethod.includes(data.paymentMethod)) {
                    throw new common_1.BadRequestException({ status: 'error', message: 'Invalid payment method.' });
                }
                const invoiceId = await this.generateInvoiceId();
                const appName = configService.get('APP_NAME');
                const paymentAmount = getPaymentMethod.find((item) => item.paymentMethod === data.paymentMethod).amount;
                const signature = this.hash('md5', `${duitkuMerchantCode}${invoiceId}${paymentAmount}${duitkuApiKey}`);
                const createInvoice = await (0, rxjs_1.firstValueFrom)(httpService.post(`${duitkuDomain}/webapi/api/merchant/v2/inquiry`, {
                    merchantcode: duitkuMerchantCode,
                    merchantOrderId: invoiceId,
                    paymentAmount,
                    paymentMethod,
                    productDetails: `Pembayaran untuk ${data.productCode} di toko ${appName}`,
                    email: data.customer.email,
                    customerVaName: data.customer.name,
                    callbackUrl: configService.get('DUITKU_CALLBACK_URL'),
                    returnUrl: data.returnUrl,
                    signature: signature,
                }).pipe((0, rxjs_1.map)((response) => {
                    const result = response.data;
                    if (!result || !result.statusCode || result.statusCode !== '00') {
                        throw new common_1.InternalServerErrorException({ status: 'error', message: result.statusMessage });
                    }
                    return result;
                }), (0, rxjs_1.catchError)((error) => {
                    let err;
                    if (error.response) {
                        err = error.response.data.Message || 'Unknown error';
                    }
                    else if (error.request) {
                        err = 'No response from Duitku server';
                    }
                    else {
                        err = error.message;
                    }
                    throw new common_1.InternalServerErrorException({ status: 'error', message: err });
                })));
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
                    paymentStatus: client_1.PaymentStatus.pending,
                    topupStatus: client_1.TopupStatus.pending,
                };
                const create = await prisma.transaction.create({ data: createParams });
                return {
                    status: 'ok',
                    data: create,
                    message: 'Transaction created successfully.',
                };
            });
            return result;
        }
        catch (error) {
            throw new common_1.InternalServerErrorException({ status: 'error', message: error.message });
        }
    }
    async updateInvoice(data) {
        const prisma = this.prisma;
        const { topupQueue, duitkuMerchantCode, duitkuApiKey, hash } = this;
        try {
            if (!data.merchantCode || !data.merchantOrderId || !data.signature) {
                throw new common_1.BadRequestException({ status: 'error', message: 'Invalid request' });
            }
            const signature = hash('md5', `${duitkuMerchantCode}:${duitkuApiKey}:${data.merchantOrderId}`);
            if (signature !== data.signature) {
                throw new common_1.BadRequestException({ status: 'error', message: 'Invalid signature' });
            }
            const result = await prisma.$transaction(async (prisma) => {
                const find = await prisma.transaction.findFirst({
                    where: { trxId: data.merchantOrderId },
                    include: { variation: { select: { productCode: true } } }
                });
                if (!find) {
                    throw new common_1.BadRequestException({ status: 'error', message: 'Transaction ID not found.' });
                }
                let status = data.resultCode === '00' ? client_1.PaymentStatus.success : client_1.PaymentStatus.failed;
                const update = await prisma.transaction.update({
                    where: { trxId: data.merchantOrderId },
                    data: {
                        paymentStatus: status,
                        duitku: JSON.parse(JSON.stringify(data))
                    }
                });
                if (status === client_1.PaymentStatus.success) {
                    await topupQueue.add('topup', { topupData: find });
                }
                return {
                    status: 'ok',
                    data: update,
                    message: 'Transaction updated successfully.',
                };
            });
            return result;
        }
        catch (error) {
            throw new common_1.InternalServerErrorException({ status: 'error', message: error.message });
        }
    }
    async getPaymentMethod(amount) {
        const { httpService, duitkuDomain, duitkuMerchantCode, duitkuApiKey, hash, padZero } = this;
        try {
            const now = new Date();
            const year = now.getFullYear();
            const month = padZero(now.getMonth() + 1);
            const day = padZero(now.getDate());
            const hours = padZero(now.getHours());
            const minutes = padZero(now.getMinutes());
            const seconds = padZero(now.getSeconds());
            const datetime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            const signature = hash('sha256', `${duitkuMerchantCode}${amount}${datetime}${duitkuApiKey}`);
            const getPayment = await (0, rxjs_1.firstValueFrom)(httpService.post(`${duitkuDomain}/webapi/api/merchant/paymentmethod/getpaymentmethod`, {
                merchantcode: duitkuMerchantCode,
                amount: amount,
                datetime: datetime,
                signature: signature,
            }).pipe((0, rxjs_1.map)((response) => {
                const result = response.data;
                if (!result || !result.responseCode || result.responseCode !== '00') {
                    throw new common_1.InternalServerErrorException({ status: 'error', message: result.responseMessage });
                }
                return result;
            }), (0, rxjs_1.catchError)((error) => {
                let err;
                if (error.response) {
                    err = error.response.data.Message || 'Unknown error';
                }
                else if (error.request) {
                    err = 'No response from Duitku server';
                }
                else {
                    err = error.message;
                }
                throw new common_1.InternalServerErrorException({ status: 'error', message: err });
            })));
            return getPayment.data.paymentFee;
        }
        catch (error) {
            throw new common_1.InternalServerErrorException({ status: 'error', message: error.message });
        }
    }
    async exportXLS(searchTerm, perPage, page, paymentStatus, topupStatus, startDate, endDate, orderBy) {
        try {
            const query = await this.findAll(searchTerm, perPage, page, paymentStatus, topupStatus, startDate, endDate, orderBy);
            let title = 'Transaction Report';
            if (startDate)
                title += ` from ${startDate.toDateString()}`;
            if (endDate)
                title += ` up to ${endDate.toDateString()}`;
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet(title);
            worksheet.columns = [
                { header: 'Transaction ID', key: 'trxId' },
                { header: 'Product', key: 'product' },
                { header: 'Variation', key: 'variation' },
                { header: 'Destination', key: 'destination' },
                { header: 'Amount', key: 'amount' },
                { header: 'Payment Status', key: 'paymentStatus' },
                { header: 'Topup Status', key: 'topupStatus' },
                { header: 'Billed', key: 'createdAt' },
            ];
            for (let i = 0; i < query['data'].length; i++) {
                const createdAt = new Date(query['data'][i]['createdAt']);
                query['data'][i]['product'] = query['data'][i]['product']['title'];
                query['data'][i]['variation'] = query['data'][i]['variation']['productCode'];
                query['data'][i]['createdAt'] = this.readableDate(createdAt);
                query['data'][i]['amount'] = this.formatToIDR(query['data'][i]['amount']);
                query['data'][i]['destination'] = query['data'][i]['customer'][0]['id'];
                if (query['data'][i]['customer'][0]['serverId']) {
                    query['data'][i]['destination'] += `-${query['data'][i]['customer'][0]['serverId']}`;
                }
                worksheet.addRow(query['data'][i]);
            }
            const buffer = await workbook.xlsx.writeBuffer();
            return { title, buffer };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException({ status: 'error', message: error.message });
        }
    }
    async checkCustomer(productId, customer) {
        const product = await this.prisma.product.findUnique({ where: { id: productId }, select: { form: true } });
        if (!product)
            throw new common_1.BadRequestException({ status: 'error', message: 'Product not found.' });
        const formList = product.form[0];
        const customerMap = new Map(customer.map((cs) => [cs.name, cs]));
        const missingFields = formList.filter(form => !customerMap.has(form.name));
        if (missingFields.length > 0) {
            throw new common_1.BadRequestException({
                status: 'error',
                message: `${missingFields.map((form) => form.name).join(', ')} is missing.`
            });
        }
        const typeError = formList
            .filter(form => {
            const cs = customerMap.get(form.name);
            return cs && typeof cs[form.name] !== form.type;
        })
            .map(form => `${form.name} must be type ${form.type}`);
        if (typeError.length > 0)
            throw new common_1.BadRequestException({ status: 'error', message: typeError.join(', ') });
    }
    async generateInvoiceId() {
        while (true) {
            const uniqueID = await this.createUniqueID();
            const check = await this.prisma.transaction.findUnique({ where: { trxId: uniqueID } });
            if (!check)
                return uniqueID;
        }
    }
    async createUniqueID() {
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
    hash(method, data) {
        return (0, crypto_1.createHash)(method).update(data).digest('hex');
    }
    readableDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    }
    formatToIDR(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(amount);
    }
    padZero(num) {
        return num < 10 ? '0' + num : num;
    }
};
exports.TransactionService = TransactionService;
exports.TransactionService = TransactionService = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, bull_1.InjectQueue)('topup-games')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        axios_1.HttpService,
        config_1.ConfigService,
        discount_service_1.DiscountService, Object])
], TransactionService);
//# sourceMappingURL=transaction.service.js.map