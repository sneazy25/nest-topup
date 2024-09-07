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
var TopupProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopupProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const topup_service_1 = require("../../topup/topup.service");
let TopupProcessor = TopupProcessor_1 = class TopupProcessor {
    constructor(topupService) {
        this.topupService = topupService;
        this.logger = new common_1.Logger(TopupProcessor_1.name);
    }
    async handleTopup(job) {
        this.logger.log(`Processing job ${job.id} of type ${job.name}`);
        await this.topupService.createTopup(job.data.topupData);
    }
    onCompleted(job) {
        this.logger.log(`Job ${job.id} completed`);
    }
    onError(error) {
        this.logger.error(`Error: ${error.message}`);
    }
    onFailed(job, error) {
        this.logger.error(`Job ${job.id} failed with error: ${error.message}`);
    }
};
exports.TopupProcessor = TopupProcessor;
__decorate([
    (0, bull_1.Process)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TopupProcessor.prototype, "handleTopup", null);
__decorate([
    (0, bull_1.OnQueueCompleted)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TopupProcessor.prototype, "onCompleted", null);
__decorate([
    (0, bull_1.OnQueueError)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Error]),
    __metadata("design:returntype", void 0)
], TopupProcessor.prototype, "onError", null);
__decorate([
    (0, bull_1.OnQueueFailed)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Error]),
    __metadata("design:returntype", void 0)
], TopupProcessor.prototype, "onFailed", null);
exports.TopupProcessor = TopupProcessor = TopupProcessor_1 = __decorate([
    (0, bull_1.Processor)('topup'),
    __metadata("design:paramtypes", [topup_service_1.TopupService])
], TopupProcessor);
//# sourceMappingURL=topup-queue.processor.js.map