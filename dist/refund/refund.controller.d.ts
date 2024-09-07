import { RefundService } from './refund.service';
import { CreateRefundDto } from './create.dto';
export declare class RefundController {
    private readonly refundService;
    constructor(refundService: RefundService);
    findAll(): object;
    findOne(id: number): object;
    create(data: CreateRefundDto): object;
    update(id: number, data: any): object;
}
