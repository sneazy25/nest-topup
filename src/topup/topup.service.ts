import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bull';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { firstValueFrom, map, catchError } from 'rxjs';
import { Queue } from 'bull';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma.service';
import { TopupStatus } from '@prisma/client';
import { ResponseInterface } from './response.interface';

@Injectable()
export class TopupService {
    private apigamesDomain: string;
    private merchantcode: string;
    private apigamesApiKey: string;

    constructor(
        private readonly prisma: PrismaService,
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        @InjectQueue('send-notification') private readonly sendNotifQueue: Queue
    ) {
        this.apigamesDomain = this.configService.get<string>('APIGAMES_DOMAIN');
        this.merchantcode = this.configService.get<string>('APIGAMES_MERCHANT_CODE')
        this.apigamesApiKey = this.configService.get<string>('APIGAMES_API_KEY')
    }

    async createTopup(topupData: any): Promise<any> {
        const prisma = this.prisma;
        const { httpService, apigamesDomain, merchantcode, apigamesApiKey, hash, sendNotifQueue } = this;

        try {
            const TrxId = topupData.trxId;
            const signature = hash('md5', `${merchantcode}:${apigamesApiKey}:${TrxId}`);

            const result = await prisma.$transaction(async (prisma) => {
                const postTransaction: AxiosResponse<any> = await firstValueFrom(
                    httpService.post(`${apigamesDomain}/v2/transaksi`, {
                        ref_id: TrxId,
                        merchant_id: merchantcode,
                        produk: topupData.variation.productCode,
                        tujuan: topupData.customer[0].destination,
                        server_id: topupData.customer[0].serverId,
                        signature: signature,
                    }).pipe(
                        map((response: AxiosResponse<any>) => {
                            const result = response.data;
                            if (!result || !result.status) {
                                throw new InternalServerErrorException({ status: 'error', message: result.error_msg });
                            }
                            return result;
                        }),
                        catchError((error: any) => {
                            let err: any;
                            if (error.response) {
                                err = error.response.data.error_msg || 'Unknown error';
                            } else if (error.request) {
                                err = 'No response from Apigames server';
                            } else {
                                err = error.message;
                            }
                            throw new InternalServerErrorException({ status: 'error', message: err });
                        })
                    )
                );

                let status: TopupStatus = this.setStatus(postTransaction.data.status);

                const update = await prisma.transaction.update({
                    where: { trxId: TrxId },
                    data: {
                        topupStatus: status,
                        apigames: JSON.parse(JSON.stringify(postTransaction.data))
                    }
                });

                return { status: 'ok', message: 'Topup created', data: update };
            });

            return result;

        } catch (error) {
            await sendNotifQueue.add('sendNotification', { trxId: topupData.trxId });
            throw new InternalServerErrorException('Failed to create topup');
        }
    }

    async updateTopup(apigamesAuth: string, data: ResponseInterface): Promise<any> {
        const prisma = this.prisma;
        const { apigamesApiKey, merchantcode, setStatus, hash, sendNotifQueue } = this;
        try {
            const signature = hash('md5', `${merchantcode}:${apigamesApiKey}:${data.ref_id}`);

            const result = await prisma.$transaction(async (prisma) => {
                if (!data.merchant_id || !data.ref_id || !data.status) throw new BadRequestException({ status: 'error', message: 'Invalid request' });

                if (signature !== apigamesAuth) throw new BadRequestException({ status: 'error', message: 'Invalid signature' });

                const find = await prisma.transaction.findFirst({
                    where: { trxId: data.ref_id }
                });

                if (!find) throw new BadRequestException({ status: 'error', message: 'Transaction ID not found.' });

                let status: TopupStatus = setStatus(data.status);
                const update = await prisma.transaction.update({
                    where: { trxId: data.ref_id },
                    data: {
                        topupStatus: status,
                        apigames: JSON.parse(JSON.stringify(data))
                    }
                })

                await sendNotifQueue.add('sendNotification', { trxId: data.ref_id });
                return { status: 'ok', message: 'Topup status updated', data: update }
            });

            return result;
        } catch (error) {
            await sendNotifQueue.add('sendNotification', { trxId: data.ref_id });
            throw new InternalServerErrorException({ status: 'error', message: 'Failed to update topup status' });
        }
    }

    private setStatus(sts: string): TopupStatus {
        let status: TopupStatus;
        switch (sts) {
            case 'Sukses':
                status = TopupStatus.success
                break;

            case 'Gagal':
                status = TopupStatus.failed
                break;

            case 'Validasi Provider':
                status = TopupStatus.validation
                break;

            case 'Sukses Sebagian':
                status = TopupStatus.partial
                break;

            case 'Proses':
                status = TopupStatus.process
                break;

            case 'Pending':
                status = TopupStatus.process
                break;
        }

        return status
    }

    private hash(method: string, data: string): string {
        return createHash(method).update(data).digest('hex')
    }
}
