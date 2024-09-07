interface product_detail {
    name: string;
    code: string;
    price: number;
    price_unit: string;
    rate: number;
    price_rp: number;
}
export interface ResponseInterface {
    merchant_id: string;
    trx_id: string;
    ref_id: string;
    destination: string;
    product_code: string;
    product_code_master: string;
    message: string;
    status: string;
    sn: string;
    last_balance: string;
    product_detail: product_detail;
}
export {};
