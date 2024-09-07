import { Job } from "bull";
import { TopupService } from 'src/topup/topup.service';
export declare class TopupProcessor {
    private readonly topupService;
    constructor(topupService: TopupService);
    private readonly logger;
    handleTopup(job: Job): Promise<any>;
    onCompleted(job: Job): void;
    onError(error: Error): void;
    onFailed(job: Job, error: Error): void;
}
