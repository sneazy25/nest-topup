"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionModule = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const axios_1 = require("@nestjs/axios");
const prisma_service_1 = require("../prisma.service");
const topup_queue_module_1 = require("../job/topup/topup-queue.module");
const transaction_controller_1 = require("./transaction.controller");
const transaction_service_1 = require("./transaction.service");
const discount_service_1 = require("../discount/discount.service");
let TransactionModule = class TransactionModule {
};
exports.TransactionModule = TransactionModule;
exports.TransactionModule = TransactionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bull_1.BullModule.registerQueue({
                name: 'topup-games',
            }),
            axios_1.HttpModule, topup_queue_module_1.TopupQueueModule
        ],
        controllers: [transaction_controller_1.TransactionController],
        providers: [prisma_service_1.PrismaService, discount_service_1.DiscountService, transaction_service_1.TransactionService]
    })
], TransactionModule);
//# sourceMappingURL=transaction.module.js.map