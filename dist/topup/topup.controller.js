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
exports.TopupController = void 0;
const common_1 = require("@nestjs/common");
const topup_service_1 = require("./topup.service");
let TopupController = class TopupController {
    constructor(topupService) {
        this.topupService = topupService;
    }
    update(auth, data) {
        if (!auth)
            throw new common_1.BadRequestException({ status: 'error', message: 'Authorization header is required' });
        return this.topupService.updateTopup(auth, data);
    }
};
exports.TopupController = TopupController;
__decorate([
    (0, common_1.Post)('update'),
    __param(0, (0, common_1.Headers)('X-Apigames-Authorization')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Object)
], TopupController.prototype, "update", null);
exports.TopupController = TopupController = __decorate([
    (0, common_1.Controller)('topup'),
    __metadata("design:paramtypes", [topup_service_1.TopupService])
], TopupController);
//# sourceMappingURL=topup.controller.js.map