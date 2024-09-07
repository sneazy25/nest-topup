import { ProductService } from './product.service';
import { CreateDto } from './create.dto';
import { UpdateDto } from './update.dto';
export declare class ProductController {
    private readonly productService;
    constructor(productService: ProductService);
    getAllProduct(): object;
    findProduct(query: string): object;
    getProduct(id: number): object;
    addProduct(create: CreateDto): Promise<object>;
    updateProduct(id: number, update: UpdateDto): object;
    destroyProduct(id: number): object;
}
