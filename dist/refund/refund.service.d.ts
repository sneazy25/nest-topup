import { PrismaService } from 'src/prisma.service';
import { CreateRefundDto } from './create.dto';
import { ConfigService } from '@nestjs/config';
import { UpdateRefundDto } from './update.dto';
export declare class RefundService {
    private prisma;
    private configService;
    constructor(prisma: PrismaService, configService: ConfigService);
    create(data: CreateRefundDto): Promise<object>;
    findAll(): Promise<object>;
    findOne(id: number): Promise<object>;
    update(id: number, data: UpdateRefundDto): Promise<object>;
    private hash;
}
