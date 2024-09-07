import * as dotenv from 'dotenv';
import * as fs from 'fs';

const env = dotenv.parse(fs.readFileSync('.env'));

export default {
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
}