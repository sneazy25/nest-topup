import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { TopupModule } from "src/topup/topup.module";
import { NotificationModule } from "src/notification/notification.module";
import { QueueConfigProvider } from "./config.provider";

@Module({
    imports: [
        BullModule.forRootAsync({ useClass: QueueConfigProvider }),
        BullModule.registerQueue({ name: 'topup-games' }, { name: 'send-notification' }),
        TopupModule,
        NotificationModule
    ],
    exports: [BullModule]
})

export class QueueConfigModule { }