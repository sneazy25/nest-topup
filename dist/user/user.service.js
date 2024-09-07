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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let UserService = class UserService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        try {
            const get = await this.prisma.user.findMany();
            return {
                status: 'ok',
                data: get,
                message: 'Users retrieved successfully.',
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException({ status: 'error', message: error.message });
        }
    }
    async findByEmail(email) {
        try {
            let find = await this.prisma.user.findUnique({
                where: { email: email },
            });
            if (!find) {
                return { status: 'error', message: 'Cannot find the user.' };
            }
            return { status: 'ok', data: find, message: 'User retrieved successfully.' };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException({ status: 'error', message: error.message });
        }
    }
    async findUser(id) {
        try {
            const find = await this.prisma.user.findUnique({
                where: { id: Number(id) },
            });
            if (!find) {
                throw new common_1.NotFoundException({ status: 'error', message: 'User not found.' });
            }
            return { status: "ok", data: find, message: "User retrieved successfully." };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException({ status: 'error', message: error.message });
        }
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UserService);
//# sourceMappingURL=user.service.js.map