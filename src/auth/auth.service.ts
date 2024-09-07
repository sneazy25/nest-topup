import { Injectable, UnauthorizedException, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { UserService } from '../user/user.service';
import { RegisterDto } from './register.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async login(email: string, password: string): Promise<object> {
        const user = await this.userService.findByEmail(email)
        if (user.data) {
            const isMatch = await bcrypt.compare(password, user.data.password)
            if (!isMatch) throw new UnauthorizedException({
                status: 'error',
                message: 'Invalid credentials.',
            })
        } else {
            throw new NotFoundException({
                status: 'error',
                message: 'User not found.',
            })
        }

        const token = await this.jwtService.signAsync(user.data, { secret: this.configService.get('JWT_SECRET') })
        return {
            status: 'ok',
            message: 'Login user successfully.',
            access_token: token,
        }
    }

    async register(registerDto: RegisterDto): Promise<any> {
        const user = await this.userService.findByEmail(registerDto.email)
        if (user.data) {
            throw new BadRequestException({
                status: 'error',
                message: 'User already exist.',
            })
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, 10)
        try {
            const newUser = await this.prisma.user.create({
                data: {
                    name: registerDto.name,
                    email: registerDto.email,
                    password: hashedPassword,
                }
            })

            const token = await this.jwtService.signAsync(newUser, { secret: this.configService.get('JWT_SECRET') })

            return {
                status: 'ok',
                message: 'Register user successfully.',
                access_token: token,
            }
        } catch (error) {
            throw new InternalServerErrorException({
                status: 'error',
                message: error,
            })
        }
    }
}
