declare class Variation {
    product_code: string;
    title: string;
    description: string;
    price: number;
    published: boolean;
}
export declare class CreateDto {
    title: string;
    description: string;
    slug: string;
    poster: string;
    categories: string[];
    variations: Variation;
    form: any;
    published: boolean;
}
export {};
