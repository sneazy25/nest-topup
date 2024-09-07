import { DiscountService } from './discount.service';
import { CreateDiscountDto } from './create.dto';
import { UpdateDiscountDto } from './update.dto';
export declare class DiscountController {
    private readonly discountService;
    constructor(discountService: DiscountService);
    getAllDiscount(): object;
    getDiscountByProduct(id: number): object;
    getDiscount(id: number): object;
    createDiscount(create: CreateDiscountDto): object;
    updateDiscount(id: number, update: UpdateDiscountDto): object;
    deleteDiscount(id: number): object;
}
