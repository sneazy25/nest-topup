"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const user_controller_1 = require("./user/user.controller");
const auth_controller_1 = require("./auth/auth.controller");
const user_service_1 = require("./user/user.service");
const prisma_service_1 = require("./prisma.service");
const user_module_1 = require("./user/user.module");
const auth_module_1 = require("./auth/auth.module");
const auth_service_1 = require("./auth/auth.service");
const product_controller_1 = require("./product/product.controller");
const product_module_1 = require("./product/product.module");
const product_service_1 = require("./product/product.service");
const category_controller_1 = require("./category/category.controller");
const category_module_1 = require("./category/category.module");
const category_service_1 = require("./category/category.service");
const discount_module_1 = require("./discount/discount.module");
const discount_controller_1 = require("./discount/discount.controller");
const discount_service_1 = require("./discount/discount.service");
const transaction_module_1 = require("./transaction/transaction.module");
const axios_1 = require("@nestjs/axios");
const topup_module_1 = require("./topup/topup.module");
const export_module_1 = require("./export/export.module");
const notification_module_1 = require("./notification/notification.module");
const mailer_1 = require("@nestjs-modules/mailer");
const refund_module_1 = require("./refund/refund.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
            mailer_1.MailerModule.forRoot({
                transport: {
                    host: process.env.EMAIL_HOST,
                    port: Number(process.env.EMAIL_PORT),
                    auth: {
                        user: process.env.EMAIL_USERNAME,
                        pass: process.env.EMAIL_PASSWORD,
                    },
                },
            }),
            axios_1.HttpModule, auth_module_1.AuthModule, user_module_1.UserModule, product_module_1.ProductModule, category_module_1.CategoryModule, discount_module_1.DiscountModule, transaction_module_1.TransactionModule, topup_module_1.TopupModule, export_module_1.ExportModule, notification_module_1.NotificationModule, refund_module_1.RefundModule
        ],
        controllers: [auth_controller_1.AuthController, user_controller_1.UserController, product_controller_1.ProductController, category_controller_1.CategoryController, discount_controller_1.DiscountController],
        providers: [prisma_service_1.PrismaService, auth_service_1.AuthService, user_service_1.UserService, product_service_1.ProductService, category_service_1.CategoryService, discount_service_1.DiscountService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map