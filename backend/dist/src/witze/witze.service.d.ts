import { PrismaService } from '../prisma/prisma.service';
export declare class WitzeService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId?: number): Promise<{
        likes: number;
        userLiked: boolean | 0 | undefined;
        author: {
            username: string;
        } | null;
        kategorie: {
            name: string;
            emoji: string;
        } | null;
        likeLikes: {
            id: number;
            userId: number;
            witzId: number;
        }[];
        _count: {
            likeLikes: number;
        };
        id: number;
        text: string;
        authorId: number | null;
        kategorieId: number | null;
        createdAt: Date;
    }[]>;
    findRandom(): Promise<{
        id: number;
        text: string;
        authorId: number | null;
        kategorieId: number | null;
        likes: number;
        createdAt: Date;
    } | null>;
    create(text: string, authorId: number, kategorieId?: number): Promise<{
        author: {
            id: number;
            username: string;
            email: string;
            password: string;
        } | null;
        kategorie: {
            id: number;
            createdAt: Date;
            name: string;
            emoji: string;
        } | null;
    } & {
        id: number;
        text: string;
        authorId: number | null;
        kategorieId: number | null;
        likes: number;
        createdAt: Date;
    }>;
    findByUser(userId: number): Promise<{
        id: number;
        text: string;
        authorId: number | null;
        kategorieId: number | null;
        likes: number;
        createdAt: Date;
    }[]>;
    remove(id: number, userId: number): Promise<{
        id: number;
        text: string;
        authorId: number | null;
        kategorieId: number | null;
        likes: number;
        createdAt: Date;
    }>;
    like(id: number, userId: number): Promise<{
        liked: boolean;
        likes: number;
    }>;
    getProfile(userId: number): Promise<{
        witze: {
            id: number;
            text: string;
            authorId: number | null;
            kategorieId: number | null;
            likes: number;
            createdAt: Date;
        }[];
        likesReceived: number;
        rang: string;
        username: string;
        email: string;
    }>;
    private getRang;
    findOne(id: number, userId?: number): Promise<{
        likes: number;
        userLiked: boolean | 0 | undefined;
        author: {
            username: string;
            email: string;
        } | null;
        kategorie: {
            id: number;
            createdAt: Date;
            name: string;
            emoji: string;
        } | null;
        likeLikes: {
            id: number;
            userId: number;
            witzId: number;
        }[];
        _count: {
            likeLikes: number;
        };
        id: number;
        text: string;
        authorId: number | null;
        kategorieId: number | null;
        createdAt: Date;
    }>;
    findAllKategorien(): Promise<{
        id: number;
        name: string;
        emoji: string;
    }[]>;
    findUserWitze(userId: number): Promise<({
        author: {
            username: string;
        } | null;
        kategorie: {
            id: number;
            createdAt: Date;
            name: string;
            emoji: string;
        } | null;
    } & {
        id: number;
        text: string;
        authorId: number | null;
        kategorieId: number | null;
        likes: number;
        createdAt: Date;
    })[]>;
}
