import { ResponseInterface } from './response.interface';
import { TopupService } from './topup.service';
export declare class TopupController {
    private readonly topupService;
    constructor(topupService: TopupService);
    update(auth: string, data: ResponseInterface): object;
}
