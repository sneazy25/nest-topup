import { ConfigService } from '@nestjs/config';
export declare class JwtConstants {
    private configService;
    static secret: string;
    constructor(configService: ConfigService);
}
