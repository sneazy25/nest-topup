import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { UserService } from '../user/user.service';
import { RegisterDto } from './register.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly userService;
    private readonly jwtService;
    constructor(prisma: PrismaService, userService: UserService, jwtService: JwtService);
    login(email: string, password: string): Promise<object>;
    register(registerDto: RegisterDto): Promise<any>;
}
