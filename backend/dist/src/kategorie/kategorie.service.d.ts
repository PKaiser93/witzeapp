import { PrismaService } from '../prisma/prisma.service';
export declare class KategorieService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        createdAt: Date;
        name: string;
        emoji: string;
    }[]>;
    create(name: string, emoji: string): Promise<{
        id: number;
        createdAt: Date;
        name: string;
        emoji: string;
    }>;
}
