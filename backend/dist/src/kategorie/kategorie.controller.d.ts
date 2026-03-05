import { KategorieService } from './kategorie.service';
export declare class KategorieController {
    private readonly kategorieService;
    constructor(kategorieService: KategorieService);
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
