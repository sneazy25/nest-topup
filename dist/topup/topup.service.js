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
exports.TopupService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bull_1 = require("@nestjs/bull");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma.service");
const client_1 = require("@prisma/client");
let TopupService = class TopupService {
    constructor(prisma, httpService, configService, sendNotifQueue) {
        this.prisma = prisma;
        this.httpService = httpService;
        this.configService = configService;
        this.sendNotifQueue = sendNotifQueue;
        this.apigamesDomain = this.configService.get('APIGAMES_DOMAIN');
        this.merchantcode = this.configService.get('APIGAMES_MERCHANT_CODE');
        this.apigamesApiKey = this.configService.get('APIGAMES_API_KEY');
    }
    async createTopup(topupData) {
        const prisma = this.prisma;
        const { httpService, apigamesDomain, merchantcode, apigamesApiKey, hash, sendNotifQueue } = this;
        try {
            const TrxId = topupData.trxId;
            const signature = hash('md5', `${merchantcode}:${apigamesApiKey}:${TrxId}`);
            const result = await prisma.$transaction(async (prisma) => {
                const postTransaction = await (0, rxjs_1.firstValueFrom)(httpService.post(`${apigamesDomain}/v2/transaksi`, {
                    ref_id: TrxId,
                    merchant_id: merchantcode,
                    produk: topupData.variation.productCode,
                    tujuan: topupData.customer[0].id,
                    server_id: topupData.customer[0].serverId,
                    signature: signature,
                }).pipe((0, rxjs_1.map)((response) => {
                    const result = response.data;
                    if (!result || !result.status) {
                        throw new common_1.InternalServerErrorException({ status: 'error', message: result.error_msg });
                    }
                    return result;
                }), (0, rxjs_1.catchError)((error) => {
                    let err;
                    if (error.response) {
                        err = error.response.data.error_msg || 'Unknown error';
                    }
                    else if (error.request) {
                        err = 'No response from Apigames server';
                    }
                    else {
                        err = error.message;
                    }
                    throw new common_1.InternalServerErrorException({ status: 'error', message: err });
                })));
                let status = this.setStatus(postTransaction.data.status);
                const update = await prisma.transaction.update({
                    where: { trxId: TrxId },
                    data: {
                        topupStatus: status,
                        apigames: JSON.parse(JSON.stringify(postTransaction.data))
                    }
                });
                return { status: 'ok', message: 'Topup created', data: update };
            });
            return result;
        }
        catch (error) {
            await sendNotifQueue.add('sendNotification', { trxId: topupData.trxId });
            throw new common_1.InternalServerErrorException('Failed to create topup');
        }
    }
    async updateTopup(apigamesAuth, data) {
        const prisma = this.prisma;
        const { apigamesApiKey, merchantcode, setStatus, hash, sendNotifQueue } = this;
        try {
            const signature = hash('md5', `${merchantcode}:${apigamesApiKey}:${data.ref_id}`);
            const result = await prisma.$transaction(async (prisma) => {
                if (!data.merchant_id || !data.ref_id || !data.status)
                    throw new common_1.BadRequestException({ status: 'error', message: 'Invalid request' });
                if (signature !== apigamesAuth)
                    throw new common_1.BadRequestException({ status: 'error', message: 'Invalid signature' });
                const find = await prisma.transaction.findFirst({
                    where: { trxId: data.ref_id }
                });
                if (!find)
                    throw new common_1.BadRequestException({ status: 'error', message: 'Transaction ID not found.' });
                let status = setStatus(data.status);
                const update = await prisma.transaction.update({
                    where: { trxId: data.ref_id },
                    data: {
                        topupStatus: status,
                        apigames: JSON.parse(JSON.stringify(data))
                    }
                });
                await sendNotifQueue.add('sendNotification', { trxId: data.ref_id });
                return { status: 'ok', message: 'Topup status updated', data: update };
            });
            return result;
        }
        catch (error) {
            await sendNotifQueue.add('sendNotification', { trxId: data.ref_id });
            throw new common_1.InternalServerErrorException({ status: 'error', message: 'Failed to update topup status' });
        }
    }
    setStatus(sts) {
        let status;
        switch (sts) {
            case 'Sukses':
                status = client_1.TopupStatus.success;
                break;
            case 'Gagal':
                status = client_1.TopupStatus.failed;
                break;
            case 'Validasi Provider':
                status = client_1.TopupStatus.validation;
                break;
            case 'Sukses Sebagian':
                status = client_1.TopupStatus.partial;
                break;
            case 'Proses':
                status = client_1.TopupStatus.process;
                break;
            case 'Pending':
                status = client_1.TopupStatus.process;
                break;
        }
        return status;
    }
    hash(method, data) {
        return (0, crypto_1.createHash)(method).update(data).digest('hex');
    }
};
exports.TopupService = TopupService;
exports.TopupService = TopupService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, bull_1.InjectQueue)('send-notification')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        axios_1.HttpService,
        config_1.ConfigService, Object])
], TopupService);
//# sourceMappingURL=topup.service.js.map