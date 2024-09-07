import { PrismaService } from 'src/prisma.service';
import { CreateDiscountDto } from './create.dto';
import { UpdateDiscountDto } from './update.dto';
export declare class DiscountService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<object>;
    getDiscount(id: number): Promise<object>;
    getDiscountByProduct(productId: number): Promise<object>;
    createDiscount(createDto: CreateDiscountDto): Promise<object>;
    updateDiscount(id: number, updateDto: UpdateDiscountDto): Promise<object>;
    deleteDiscount(id: number): Promise<object>;
    useDiscount(discountCode: string, productId: number, amount: number): Promise<number | object>;
    private checkDiscountType;
}
