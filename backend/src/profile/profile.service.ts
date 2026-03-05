import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ProfileWitz {
    id: number;
    text: string;
    likes: number;
    createdAt: Date;
    updatedAt?: Date;
    isEdited: boolean;
}

export interface ProfileResponse {
    witze: ProfileWitz[];
    likesReceived: number;
    rang: string;
    username: string;
    email: string;
}

@Injectable()
export class ProfileService {
    constructor(private readonly prisma: PrismaService) {}

    async getProfile(userId: number): Promise<ProfileResponse> {
        const [witzeRaw, likesReceived, user] = await Promise.all([
            this.prisma.witz.findMany({
                where: { authorId: userId },
                select: { id: true, text: true, likes: true, createdAt: true, updatedAt: true },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.like.count({ where: { witz: { authorId: userId } } }),
            this.prisma.user.findUnique({
                where: { id: userId },
                select: { username: true, email: true },
            }),
        ]);

        const witze: ProfileWitz[] = witzeRaw.map((w) => ({
            ...w,
            isEdited: !!(w.updatedAt && w.updatedAt.getTime() > w.createdAt.getTime()),
        }));

        let rang = '🥉 Neuling';
        if (likesReceived >= 50) rang = '🥈 Fortgeschritten';
        if (likesReceived >= 100) rang = '🥇 Meister';

        return {
            witze,
            likesReceived,
            rang,
            username: user?.username ?? 'Unbekannt',
            email: user?.email ?? '',
        };
    }

    async deleteWitz(witzId: number, userId: number): Promise<{ message: string }> {
        const witz = await this.prisma.witz.findUnique({ where: { id: witzId } });

        if (!witz) throw new NotFoundException('Witz nicht gefunden');
        if (witz.authorId !== userId) throw new ForbiddenException('Nicht dein Witz!');

        await this.prisma.witz.delete({ where: { id: witzId } });
        return { message: 'Witz gelöscht' };
    }

    async updateWitz(witzId: number, text: string, userId: number) {
        const witz = await this.prisma.witz.findUnique({ where: { id: witzId } });

        if (!witz) throw new NotFoundException('Witz nicht gefunden');
        if (witz.authorId !== userId) throw new ForbiddenException('Nicht dein Witz!');

        const updated = await this.prisma.witz.update({
            where: { id: witzId },
            data: { text, updatedAt: new Date() },
            select: { id: true, text: true, updatedAt: true, createdAt: true },
        });

        return { ...updated, isEdited: true };
    }
}
