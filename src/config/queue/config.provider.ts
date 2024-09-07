import { SharedBullConfigurationFactory } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { QueueOptions } from "bull";
import * as config from "./config";

@Injectable()
export class QueueConfigProvider implements SharedBullConfigurationFactory {
    createSharedConfiguration(): QueueOptions {
        return config as any;
    }
}