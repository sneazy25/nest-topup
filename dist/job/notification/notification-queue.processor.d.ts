import { Job } from "bull";
import { NotificationService } from "src/notification/notification.service";
export declare class NotificationProcessor {
    private readonly notification;
    constructor(notification: NotificationService);
    private readonly logger;
    handleNotification(job: Job): Promise<any>;
    onCompleted(job: Job): void;
    onError(error: Error): void;
    onFailed(job: Job, error: Error): void;
}
