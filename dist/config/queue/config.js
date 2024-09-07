"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
const fs = require("fs");
const env = dotenv.parse(fs.readFileSync('.env'));
exports.default = {
    redis: {
        host: env.REDIS_HOST,
        port: env.REDIS_HOST,
        db: env.REDIS_DB,
        password: env.REDIS_PASSWORD
    },
    prefix: 'queue',
    defaultJobOptions: {
        attemps: 3,
        removeOnComplete: true,
        backoff: {
            type: 'exponential',
            delay: 1000
        }
    }
};
//# sourceMappingURL=config.js.map