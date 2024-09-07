import { PrismaService } from '../prisma.service';
interface FindUserResult {
    status: 'ok' | 'error';
    data?: any;
    message: string;
}
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<object>;
    findByEmail(email: string): Promise<FindUserResult>;
    findUser(id: number): Promise<object>;
}
export {};
