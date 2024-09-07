import { OnQueueCompleted, OnQueueError, OnQueueFailed, Process, Processor } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import { Job } from "bull";
import { TopupService } from 'src/topup/topup.service';

@Processor('topup')
export class TopupProcessor {
    constructor(private readonly topupService: TopupService) { }

    private readonly logger = new Logger(TopupProcessor.name);

    @Process()
    async handleTopup(job: Job): Promise<any> {
        this.logger.log(`Processing job ${job.id} of type ${job.name}`);
        await this.topupService.createTopup(job.data.topupData);
    }

    @OnQueueCompleted()
    onCompleted(job: Job) {
        this.logger.log(`Job ${job.id} completed`);
    }

    @OnQueueError()
    onError(error: Error) {
        this.logger.error(`Error: ${error.message}`);
    }

    @OnQueueFailed()
    onFailed(job: Job, error: Error) {
        this.logger.error(`Job ${job.id} failed with error: ${error.message}`);
    }
}