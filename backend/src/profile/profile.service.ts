import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ProfileResponse {  // <- export hinzufügen!
    witze: Array<{
        id: number;
        text: string;
        likes: number;
        createdAt: Date;
        updatedAt?: Date;
        isEdited: boolean;  // 🔥 NEU!
    }>;
    likesReceived: number;
    rang: string;
    username: string;    // <- NEU!
    email: string;       // <- NEU!
}

@Injectable()
export class ProfileService {
    constructor(private prisma: PrismaService) { }

    async getProfile(userId: number): Promise<ProfileResponse> {
        const [witzeRaw, likesReceived, user] = await Promise.all([
            this.prisma.witz.findMany({
                where: { authorId: userId },
                select: {
                    id: true, text: true, likes: true, createdAt: true, updatedAt: true
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.like.count({ where: { witz: { authorId: userId } } }),
            this.prisma.user.findUnique({
                where: { id: userId },
                select: { username: true, email: true }
            })
        ]);

        // 🔥 isEdited zu WITZEN hinzufügen!
        const witze = witzeRaw.map(w => ({
            ...w,
            isEdited: !!(w.updatedAt && w.updatedAt.getTime() > w.createdAt.getTime())
        }));

        const totalLikes = likesReceived;
        let rang = '🥉 Neuling';
        if (totalLikes >= 50) rang = '🥈 Fortgeschritten';
        if (totalLikes >= 100) rang = '🥇 Meister';

        return {
            witze,  // 🔥 Jetzt mit isEdited!
            likesReceived: totalLikes,
            rang,
            username: user?.username || 'Unbekannt',
            email: user?.email || ''
        };
    }

    async deleteWitz(witzId: number, userId: number) {
        const witz = await this.prisma.witz.findUnique({
            where: { id: witzId },
        });

        if (!witz) throw new NotFoundException('Witz nicht gefunden');
        if (witz.authorId !== userId) throw new ForbiddenException('Nicht dein Witz!');

        await this.prisma.witz.delete({ where: { id: witzId } });
        return { message: 'Witz gelöscht' };
    }

    async updateWitz(witzId: number, text: string, userId: number) {
        const witz = await this.prisma.witz.findUnique({
            where: { id: witzId },
        });

        if (!witz) throw new NotFoundException('Witz nicht gefunden');
        if (witz.authorId !== userId) throw new ForbiddenException('Nicht dein Witz!');

        const updated = await this.prisma.witz.update({
            where: { id: witzId },
            data: {
                text,
                updatedAt: new Date()  // 🔥 Explizit setzen!
            },
            select: {
                id: true,
                text: true,
                updatedAt: true,
                createdAt: true
            },
        });

        return {
            ...updated,
            isEdited: true  // 🔥 Garantiert nach Update!
        };
    }
}
