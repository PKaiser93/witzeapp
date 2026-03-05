import { WitzeService } from './witze.service';
export declare class WitzeController {
    private readonly witzeService;
    constructor(witzeService: WitzeService);
    findAll(req: any): Promise<{
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
    create(text: string, kategorieId: number, req: any): Promise<{
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
    findMine(req: any): Promise<{
        id: number;
        text: string;
        authorId: number | null;
        kategorieId: number | null;
        likes: number;
        createdAt: Date;
    }[]>;
    findOne(id: number, req: any): Promise<{
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
    remove(id: number, req: any): Promise<{
        id: number;
        text: string;
        authorId: number | null;
        kategorieId: number | null;
        likes: number;
        createdAt: Date;
    }>;
    like(id: number, req: any): Promise<{
        liked: boolean;
        likes: number;
    }>;
    getProfileWitze(req: Request): Promise<({
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
    getKategorien(): Promise<{
        id: number;
        name: string;
        emoji: string;
    }[]>;
}
