import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Queue } from 'bull';
import { PrismaService } from 'src/prisma.service';
import { ResponseInterface } from './response.interface';
export declare class TopupService {
    private readonly prisma;
    private readonly httpService;
    private readonly configService;
    private readonly sendNotifQueue;
    private apigamesDomain;
    private merchantcode;
    private apigamesApiKey;
    constructor(prisma: PrismaService, httpService: HttpService, configService: ConfigService, sendNotifQueue: Queue);
    createTopup(topupData: any): Promise<any>;
    updateTopup(apigamesAuth: string, data: ResponseInterface): Promise<any>;
    private setStatus;
    private hash;
}
