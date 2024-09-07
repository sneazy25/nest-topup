import { SharedBullConfigurationFactory } from "@nestjs/bull";
import { QueueOptions } from "bull";
export declare class QueueConfigProvider implements SharedBullConfigurationFactory {
    createSharedConfiguration(): QueueOptions;
}
