import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { PrismaService } from 'src/prisma.service';
export declare class NotificationService {
    private readonly mailService;
    private readonly prisma;
    private readonly configService;
    private APP_NAME;
    private APP_HOST;
    private REFUND_FORM_URL;
    constructor(mailService: MailerService, prisma: PrismaService, configService: ConfigService);
    sendMail(trxId: string): Promise<void>;
    private setStatus;
    private readableDate;
    private formatToIDR;
    private mailTemplateSuccess;
    private mailTemplateFailed;
}
