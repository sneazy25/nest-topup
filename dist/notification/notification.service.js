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
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mailer_1 = require("@nestjs-modules/mailer");
const prisma_service_1 = require("../prisma.service");
let NotificationService = class NotificationService {
    constructor(mailService, prisma, configService) {
        this.mailService = mailService;
        this.prisma = prisma;
        this.configService = configService;
        this.APP_NAME = this.configService.get('APP_NAME');
        this.APP_HOST = this.configService.get('APP_HOST');
        this.REFUND_FORM_URL = this.configService.get('REFUND_FORM_URL');
    }
    async sendMail(trxId) {
        const transaction = await this.prisma.transaction.findUnique({
            where: { trxId: trxId },
            include: {
                variation: {
                    select: { title: true }
                }
            }
        });
        const subject = transaction.topupStatus === 'failed' ? `Gagal Topup untuk Transaksi ${transaction.trxId}` : `Informasi Topup untuk Transaksi ${transaction.trxId}`;
        const getTemplate = (status) => status === 'failed' ? this.mailTemplateFailed : this.mailTemplateSuccess;
        const message = getTemplate(transaction.topupStatus)(transaction.trxId, this.readableDate(transaction.createdAt.toString()), transaction.variation.title, transaction.customer[0].id, transaction.duitku['paymentMethod'], this.setStatus(transaction.topupStatus), this.formatToIDR(transaction.amount));
        this.mailService.sendMail({
            from: `${this.APP_NAME} <no-reply@${this.APP_HOST}>`,
            to: transaction.customer[0].email,
            subject: subject,
            text: message,
        });
    }
    setStatus(status) {
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
    readableDate(dateString) {
        const date = new Date(dateString);
        const options = {
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
    formatToIDR(amount) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(amount);
    }
    mailTemplateSuccess(trxId, time, product, receiver, paymentMethod, status, amount) {
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
    mailTemplateFailed(trxId, time, product, receiver, paymentMethod, status, amount) {
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
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mailer_1.MailerService,
        prisma_service_1.PrismaService,
        config_1.ConfigService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map