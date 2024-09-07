import { ConfigService } from '@nestjs/config';

export class JwtConstants {
    static secret: string;

    constructor(private configService: ConfigService) {
        JwtConstants.secret = this.configService.get<string>('JWT_SECRET');
    }
};