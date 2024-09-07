import { PrismaService } from 'src/prisma.service';
import { CreateDto } from './create.dto';
import { UpdateDto } from './update.dto';
export declare class ProductService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<object>;
    getProduct(id: number): Promise<object>;
    findProduct(query: string): Promise<object>;
    addProduct(createDto: CreateDto): Promise<object>;
    updateProduct(id: number, updateDto: UpdateDto): Promise<object>;
    deleteProduct(id: number): Promise<object>;
    private categoryOperations;
    private variationOperations;
    private checkProductCodes;
    private capitalize;
    private slugify;
}
