export interface ResponseInterface {
    merchantCode: string;
    amount: number | string;
    merchantOrderId: string;
    productDetail: string;
    additionalParam: any;
    paymentCode: string;
    resultCode: number | string;
    merchantUserId: string | null;
    reference: string;
    signature: string;
    publisherOrderId: string;
    spUserHash: any;
    settlementDate: any;
    issuerCode: any;
}
