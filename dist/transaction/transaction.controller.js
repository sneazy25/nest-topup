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
exports.TransactionController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const transaction_service_1 = require("./transaction.service");
const create_dto_1 = require("./create.dto");
let TransactionController = class TransactionController {
    constructor(transactionService) {
        this.transactionService = transactionService;
    }
    findAll(search, perPage, page, paymentStatus, topupStatus, startDate, endDate, orderBy) {
        search = search ? search : null;
        perPage = perPage ? perPage : 10;
        page = page ? page : 1;
        paymentStatus = paymentStatus ? paymentStatus : null;
        topupStatus = topupStatus ? topupStatus : null;
        const sD = startDate ? new Date(startDate) : null;
        const eD = endDate ? new Date(endDate) : null;
        orderBy = orderBy ? orderBy : { updatedAt: 'desc' };
        return this.transactionService.findAll(search, perPage, page, paymentStatus, topupStatus, sD, eD, orderBy);
    }
    check(id) {
        return this.transactionService.getInvoice(id);
    }
    checkPayment(id) {
        return this.transactionService.checkPayment(id);
    }
    create(data) {
        return this.transactionService.createInvoice(data);
    }
    update(data) {
        return this.transactionService.updateInvoice(data);
    }
    paymentMethod(data) {
        if (!data.amount)
            throw new common_1.BadRequestException({ status: 'error', message: 'Amount parameter is required' });
        return this.transactionService.getPaymentMethod(data.amount);
    }
    async exportXLS(res, search, perPage, page, paymentStatus, topupStatus, startDate, endDate, orderBy) {
        search = search ? search : null;
        perPage = perPage ? perPage : 10;
        page = page ? page : 1;
        paymentStatus = paymentStatus ? paymentStatus : null;
        topupStatus = topupStatus ? topupStatus : null;
        const sD = startDate ? new Date(startDate) : null;
        const eD = endDate ? new Date(endDate) : null;
        orderBy = orderBy ? orderBy : { updatedAt: 'desc' };
        const data = await this.transactionService.exportXLS(search, perPage, page, paymentStatus, topupStatus, sD, eD, orderBy);
        res.header('Content-Disposition', `attachment; filename=${data.title}.xlsx`);
        res.type('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(data.buffer);
    }
};
exports.TransactionController = TransactionController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('perPage')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('paymentStatus')),
    __param(4, (0, common_1.Query)('topupStatus')),
    __param(5, (0, common_1.Query)('startDate')),
    __param(6, (0, common_1.Query)('endDate')),
    __param(7, (0, common_1.Query)('orderBy')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, String, String, String, String, Object]),
    __metadata("design:returntype", Object)
], TransactionController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('check:/trxId'),
    __param(0, (0, common_1.Param)('trxId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], TransactionController.prototype, "check", null);
__decorate([
    (0, common_1.Get)('check-payment:/trxId'),
    __param(0, (0, common_1.Param)('trxId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], TransactionController.prototype, "checkPayment", null);
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_dto_1.CreateTransactionDto]),
    __metadata("design:returntype", Object)
], TransactionController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('update'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], TransactionController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('payment-method'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Object)
], TransactionController.prototype, "paymentMethod", null);
__decorate([
    (0, common_1.Get)('export'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('search')),
    __param(2, (0, common_1.Query)('perPage')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('paymentStatus')),
    __param(5, (0, common_1.Query)('topupStatus')),
    __param(6, (0, common_1.Query)('startDate')),
    __param(7, (0, common_1.Query)('endDate')),
    __param(8, (0, common_1.Query)('orderBy')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, Number, String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "exportXLS", null);
exports.TransactionController = TransactionController = __decorate([
    (0, common_1.Controller)('transaction'),
    __metadata("design:paramtypes", [transaction_service_1.TransactionService])
], TransactionController);
//# sourceMappingURL=transaction.controller.js.map