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
exports.RefundService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const client_1 = require("@prisma/client");
const crypto_1 = require("crypto");
const config_1 = require("@nestjs/config");
let RefundService = class RefundService {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
    }
    async create(data) {
        try {
            const _secret = this.configService.get('ENCRYPT_SECRET');
            if (data.signature !== this.hash('sha256', `${data.trxId}${_secret}`)) {
                throw new common_1.BadRequestException({ status: 'error', message: 'Invalid signature' });
            }
            const find = await this.prisma.transaction.findUnique({
                where: {
                    trxId: data.trxId,
                },
            });
            if (!find || find.topupStatus !== 'failed')
                throw new common_1.BadRequestException({ status: 'error', message: 'Transaction not found' });
            if (find.updatedAt < new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)) {
                throw new common_1.BadRequestException({ status: 'error', message: 'Transaction refund expired' });
            }
            const check = await this.prisma.refund.findFirst({ where: { refId: data.trxId } });
            if (check && check.status === 'success')
                throw new common_1.BadRequestException({ status: 'error', message: 'Refund already completed' });
            if (check)
                throw new common_1.BadRequestException({ status: 'error', message: 'Refund already requested' });
            data['refId'] = data.trxId;
            delete data.trxId;
            delete data.signature;
            const create = await this.prisma.refund.create({
                data: {
                    ...data,
                    status: client_1.RefundStatus.pending,
                    transaction: {
                        connect: { trxId: data['refId'] }
                    }
                },
            });
            return {
                status: 'ok',
                message: 'Refund request has been submitted',
                data: create
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException({ status: 'error', message: error.message });
        }
    }
    async findAll() {
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
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException({ status: 'error', message: error.message });
        }
    }
    async findOne(id) {
        try {
            const find = await this.prisma.refund.findUnique({
                where: {
                    id,
                },
            });
            if (!find)
                throw new common_1.BadRequestException({ status: 'error', message: 'Refund ID not found' });
            return {
                status: 'ok',
                message: 'Refund details',
                data: find
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException({ status: 'error', message: error.message });
        }
    }
    async update(id, data) {
        try {
            const find = await this.prisma.refund.findUnique({
                where: {
                    id,
                },
            });
            if (!find)
                throw new common_1.BadRequestException({ status: 'error', message: 'Refund ID not found' });
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
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException({ status: 'error', message: error.message });
        }
    }
    hash(method, data) {
        return (0, crypto_1.createHash)(method).update(data).digest('hex');
    }
};
exports.RefundService = RefundService;
exports.RefundService = RefundService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], RefundService);
//# sourceMappingURL=refund.service.js.map