import { OnQueueCompleted, OnQueueError, OnQueueFailed, Process, Processor } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import { Job } from "bull";
import { NotificationService } from "src/notification/notification.service";

@Processor('sendNotification')
export class NotificationProcessor {
    constructor(private readonly notification: NotificationService) { }

    private readonly logger = new Logger(NotificationProcessor.name);

    @Process()
    async handleNotification(job: Job): Promise<any> {
        this.logger.log(`Processing job ${job.id} of type ${job.name}`);
        await this.notification.sendMail(job.data.topupData);
    }

    @OnQueueCompleted()
    onCompleted(job: Job) {
        this.logger.log(`Job ${job.id} completed`);
    }

    @OnQueueError()
    onError(error: Error) {
        this.logger.error(`Job Error: ${error.message}`);
    }

    @OnQueueFailed()
    onFailed(job: Job, error: Error) {
        this.logger.error(`Job ${job.id} failed with error: ${error.message}`);
    }
}