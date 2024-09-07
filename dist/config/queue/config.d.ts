declare const _default: {
    redis: {
        host: string;
        port: string;
        db: string;
        password: string;
    };
    prefix: string;
    defaultJobOptions: {
        attemps: number;
        removeOnComplete: boolean;
        backoff: {
            type: string;
            delay: number;
        };
    };
};
export default _default;
