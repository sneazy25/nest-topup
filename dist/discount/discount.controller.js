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
exports.DiscountController = void 0;
const common_1 = require("@nestjs/common");
const discount_service_1 = require("./discount.service");
const create_dto_1 = require("./create.dto");
const update_dto_1 = require("./update.dto");
const auth_guard_1 = require("../auth/auth.guard");
let DiscountController = class DiscountController {
    constructor(discountService) {
        this.discountService = discountService;
    }
    getAllDiscount() {
        return this.discountService.findAll();
    }
    getDiscountByProduct(id) {
        return this.discountService.getDiscountByProduct(id);
    }
    getDiscount(id) {
        return this.discountService.getDiscount(id);
    }
    createDiscount(create) {
        return this.discountService.createDiscount(create);
    }
    updateDiscount(id, update) {
        return this.discountService.updateDiscount(id, update);
    }
    deleteDiscount(id) {
        return this.discountService.deleteDiscount(id);
    }
};
exports.DiscountController = DiscountController;
__decorate([
    (0, common_1.Get)(''),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], DiscountController.prototype, "getAllDiscount", null);
__decorate([
    (0, common_1.Get)('product/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Object)
], DiscountController.prototype, "getDiscountByProduct", null);
__decorate([
    (0, common_1.Get)('/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Object)
], DiscountController.prototype, "getDiscount", null);
__decorate([
    (0, common_1.Post)(''),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_dto_1.CreateDiscountDto]),
    __metadata("design:returntype", Object)
], DiscountController.prototype, "createDiscount", null);
__decorate([
    (0, common_1.Put)('/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_dto_1.UpdateDiscountDto]),
    __metadata("design:returntype", Object)
], DiscountController.prototype, "updateDiscount", null);
__decorate([
    (0, common_1.Delete)('/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Object)
], DiscountController.prototype, "deleteDiscount", null);
exports.DiscountController = DiscountController = __decorate([
    (0, common_1.Controller)('discount'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [discount_service_1.DiscountService])
], DiscountController);
//# sourceMappingURL=discount.controller.js.map