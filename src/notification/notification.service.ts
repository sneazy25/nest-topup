import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { PrismaService } from '../prisma.service';

@Injectable()
export class NotificationService {
    private APP_NAME: string = this.configService.get<string>('APP_NAME');
    private APP_HOST: string = this.configService.get<string>('APP_HOST');
    private REFUND_FORM_URL: string = this.configService.get<string>('REFUND_FORM_URL');

    constructor(
        private readonly mailService: MailerService,
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
    ) { }

    async sendMail(trxId: string) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { trxId: trxId },
            include: {
                variation: {
                    select: { title: true }
                }
            }
        });

        const subject = transaction.topupStatus === 'failed' ? `Gagal Topup untuk Transaksi ${transaction.trxId}` : `Informasi Topup untuk Transaksi ${transaction.trxId}`;

        const getTemplate = (status: string) =>
            status === 'failed' ? this.mailTemplateFailed : this.mailTemplateSuccess;

        const message: string = getTemplate(transaction.topupStatus)(
            transaction.trxId,
            this.readableDate(transaction.createdAt.toString()),
            transaction.variation.title,
            transaction.customer[0].id,
            transaction.duitku['paymentMethod'],
            this.setStatus(transaction.topupStatus),
            this.formatToIDR(transaction.amount)
        );

        this.mailService.sendMail({
            from: `${this.APP_NAME} <no-reply@${this.APP_HOST}>`,
            to: transaction.customer[0].email,
            subject: subject,
            text: message,
        });
    }

    private setStatus(status: string) {
        switch (status) {
            case 'success':
                return 'BERHASIL';
                break;
            case 'failed':
                return 'GAGAL';
                break;
            case 'pending':
                return 'PENDING';
                break;
            case 'process':
                return 'PROSES';
                break;
            case 'partial':
                return 'SUKSES SEBAGIAN';
                break;
            case 'validation':
                return 'VALIDASI PROVIDER';
                break;
        }
    }

    private readableDate(dateString: string) {
        const date = new Date(dateString);

        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'Asia/Jakarta',
            timeZoneName: 'short'
        };

        return new Intl.DateTimeFormat('id-ID', options).format(date);
    }

    private formatToIDR(amount: any): string {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(amount);
    }

    private mailTemplateSuccess(trxId: string, time: string, product: string, receiver: string, paymentMethod: string, status: string, amount: string) {
        return `<div style="margin:0;padding:0;font-family:&quot;Lato&quot;,sans-serif;color:#333333;font-size:14px;line-height:1.5">
    <div style="background:#f3f7f9;padding-top:30px;padding-bottom:50px">
        <div style="max-width:640px;margin:0 auto">
            <div style="height:128px;border-radius:8px 8px 0 0;background:linear-gradient(180deg,#377cfb 10%,#2b68d8 100%)">
                <h1 style="font-size:24px;color:white;margin:0;padding:50px 0;text-align:center"> BUKTI TRANSAKSI </h1>
            </div>
            <div style="border-radius:0 0 8px 8px;background:white;padding:20px 20px">
                <p style="margin:0 0 16px">
                    Transaksi kamu telah selesai kami proses dan bukti transaksinya terlampir pada email ini.
                </p>
                <div style="margin-bottom:24px">
                    <div style="font-size:16px;font-weight:bold">Detail Transaksi</div>
                    <hr style="border:none;height:1px;background:#dedede;margin:8px 0">
                    <div style="margin-bottom:10px">
                        <div style="color:#333333;display:inline-block;vertical-align:top;width:175px">ID Transaksi</div>
                        <div style="font-weight:bold;display:inline-block;vertical-align:top;width:calc(100% - 180px);text-align:right">${trxId}</div>
                    </div>
                    <div style="margin-bottom:10px">
                        <div style="color:#333333;display:inline-block;vertical-align:top;width:175px">Waktu Transaksi</div>
                        <div style="font-weight:bold;display:inline-block;vertical-align:top;width:calc(100% - 180px);text-align:right">${time}</div>
                    </div>
                    <div style="margin-bottom:10px">
                        <div style="color:#333333;display:inline-block;vertical-align:top;width:175px">Produk</div>
                        <div style="font-weight:bold;display:inline-block;vertical-align:top;width:calc(100% - 180px);text-align:right">${product}</div>
                    </div>
                    <div style="margin-bottom:10px">
                        <div style="color:#333333;display:inline-block;vertical-align:top;width:175px">Penerima</div>
                        <div style="font-weight:bold;display:inline-block;vertical-align:top;width:calc(100% - 180px);text-align:right">${receiver}</div>
                    </div>
                    <div style="margin-bottom:10px">
                        <div style="color:#333333;display:inline-block;vertical-align:top;width:175px">Metode Pembayaran</div>
                        <div style="font-weight:bold;display:inline-block;vertical-align:top;width:calc(100% - 180px);text-align:right">${paymentMethod}</div>
                    </div>
                    <div style="margin-bottom:10px">
                        <div style="color:#333333;display:inline-block;vertical-align:top;width:175px">Status Topup</div>
                        <div style="font-weight:bold;display:inline-block;vertical-align:top;width:calc(100% - 180px);text-align:right">${status}</div>
                    </div>
                    <div style="margin-bottom:10px">
                        <div style="color:#333333;display:inline-block;vertical-align:top;width:175px">Nominal</div>
                        <div style="font-weight:bold;display:inline-block;vertical-align:top;width:calc(100% - 180px);text-align:right">${amount}</div>
                    </div>
                </div>
                <hr style="border:none;height:1px;background:#dedede;margin:8px 0">&nbsp; <p style="font-size:12px;margin:0 0 16px">Catatan: <br> Biaya termasuk PPN (Bila ada) </p>
                <p style="font-size:12px;margin:0 0 16px">Terima kasih telah menggunakan Nest Topup!</p>
            </div>
        </div>
    </div>
</div>`;
    }

    private mailTemplateFailed(trxId: string, time: string, product: string, receiver: string, paymentMethod: string, status: string, amount: string) {
        return `<div style="margin:0;padding:0;font-family:&quot;Lato&quot;,sans-serif;color:#333333;font-size:14px;line-height:1.5">
    <div style="background:#f3f7f9;padding-top:30px;padding-bottom:50px">
        <div style="max-width:640px;margin:0 auto">
            <div style="height:128px;border-radius:8px 8px 0 0;background:url(https://ci3.googleusercontent.com/meips/ADKq_Nbc42cRcbRVNU4_TL8KQmS9Y_NWzudMgiZfCb51qa6ytNCvWkfb1T9_-RI87tZlCZgFcY-E6OmCazVS_UMBR7JEXM2LofD8ZIyB5pDAJYtM_hQrYNKOfjXaPexPZCe_qzfiVtkUWmsOX4CnIhmZ=s0-d-e1-ft#https://storage.googleapis.com/flip-prod-dr-assets/email_header_images/header-bubble.png),linear-gradient(180deg,#fd6542 0%,#e4244e 100%)">
                <h1 style="font-size:24px;color:white;margin:0;padding:50px 0;text-align:center"> BUKTI TRANSAKSI </h1>
            </div>
            <div style="border-radius:0 0 8px 8px;background:white;padding:20px 20px">
                <p style="margin:0 0 16px">
                    Transaksi kamu gagal kami proses dan bukti transaksinya terlampir pada email ini.
                </p>
                <div style="margin-bottom:24px">
                    <div style="font-size:16px;font-weight:bold">Detail Transaksi</div>
                    <hr style="border:none;height:1px;background:#dedede;margin:8px 0">
                    <div style="margin-bottom:10px">
                        <div style="color:#333333;display:inline-block;vertical-align:top;width:175px">ID Transaksi</div>
                        <div style="font-weight:bold;display:inline-block;vertical-align:top;width:calc(100% - 180px);text-align:right">${trxId}</div>
                    </div>
                    <div style="margin-bottom:10px">
                        <div style="color:#333333;display:inline-block;vertical-align:top;width:175px">Waktu Transaksi</div>
                        <div style="font-weight:bold;display:inline-block;vertical-align:top;width:calc(100% - 180px);text-align:right">${time}</div>
                    </div>
                    <div style="margin-bottom:10px">
                        <div style="color:#333333;display:inline-block;vertical-align:top;width:175px">Produk</div>
                        <div style="font-weight:bold;display:inline-block;vertical-align:top;width:calc(100% - 180px);text-align:right">${product}</div>
                    </div>
                    <div style="margin-bottom:10px">
                        <div style="color:#333333;display:inline-block;vertical-align:top;width:175px">Penerima</div>
                        <div style="font-weight:bold;display:inline-block;vertical-align:top;width:calc(100% - 180px);text-align:right">${receiver}</div>
                    </div>
                    <div style="margin-bottom:10px">
                        <div style="color:#333333;display:inline-block;vertical-align:top;width:175px">Metode Pembayaran</div>
                        <div style="font-weight:bold;display:inline-block;vertical-align:top;width:calc(100% - 180px);text-align:right">${paymentMethod}</div>
                    </div>
                    <div style="margin-bottom:10px">
                        <div style="color:#333333;display:inline-block;vertical-align:top;width:175px">Status Topup</div>
                        <div style="font-weight:bold;display:inline-block;vertical-align:top;width:calc(100% - 180px);text-align:right">GAGAL</div>
                    </div>
                    <div style="margin-bottom:10px">
                        <div style="color:#333333;display:inline-block;vertical-align:top;width:175px">Nominal</div>
                        <div style="font-weight:bold;display:inline-block;vertical-align:top;width:calc(100% - 180px);text-align:right">${amount}</div>
                    </div>
                </div>
                <hr style="border:none;height:1px;background:#dedede;margin:8px 0">
                <p style="text-align:center;margin:16px 0">
                    Silahkan isi formulir pengembalian dana pada tautan berikut.
                </p>
                <div style="text-align:center;margin-bottom:20px">
                    <a href="${this.REFUND_FORM_URL}" style="background:#10b981;color:#fff;font-size:1.1rem;padding:0.7rem 1rem;text-decoration:none;border-radius:20px">Pengembalian Dana</a>
                </div>
                <hr style="border:none;height:1px;background:#dedede;margin:8px 0">
                <p style="font-size:12px;margin:0 0 16px">Catatan: <br> Biaya termasuk PPN (Bila ada) </p>
                <p style="font-size:12px;margin:0 0 16px">Terima kasih telah menggunakan Nest Topup!</p>
            </div>
        </div>
    </div>
</div>`;
    }
}
