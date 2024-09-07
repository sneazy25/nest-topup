import { PrismaService } from 'src/prisma.service';
export declare class CategoryService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<object>;
    findProduct(slug: string): Promise<object>;
}
