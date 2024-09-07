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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../prisma.service");
const user_service_1 = require("../user/user.service");
let AuthService = class AuthService {
    constructor(prisma, userService, jwtService) {
        this.prisma = prisma;
        this.userService = userService;
        this.jwtService = jwtService;
    }
    async login(email, password) {
        const user = await this.userService.findByEmail(email);
        if (user.data) {
            const isMatch = await bcrypt.compare(password, user.data.password);
            if (!isMatch)
                throw new common_1.UnauthorizedException({
                    status: 'error',
                    message: 'Invalid credentials.',
                });
        }
        else {
            throw new common_1.NotFoundException({
                status: 'error',
                message: 'User not found.',
            });
        }
        const token = await this.jwtService.signAsync(user.data);
        return {
            status: 'ok',
            message: 'Login user successfully.',
            access_token: token,
        };
    }
    async register(registerDto) {
        const user = await this.userService.findByEmail(registerDto.email);
        if (user.data) {
            throw new common_1.BadRequestException({
                status: 'error',
                message: 'User already exist.',
            });
        }
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        try {
            const newUser = await this.prisma.user.create({
                data: {
                    name: registerDto.name,
                    email: registerDto.email,
                    password: hashedPassword,
                }
            });
            const token = await this.jwtService.signAsync(newUser);
            return {
                status: 'ok',
                message: 'Register user successfully.',
                access_token: token,
            };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException({
                status: 'error',
                message: error,
            });
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        user_service_1.UserService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map