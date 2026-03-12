import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { BadgesService } from '../badges/badges.service';

export interface WitzResponse {
  id: number;
  text: string;
  authorId: number | null;
  kategorieId: number | null;
  likes: number;
  createdAt: Date;
  userLiked: boolean;
  author?: { username: string; isBlueVerified?: boolean } | null;
  kategorie?: { name: string; emoji: string } | null; // ← | null ergänzen
  commentCount?: number;
}

export interface LikeResponse {
  liked: boolean;
  likes: number;
}

@Injectable()
export class WitzeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly badgeService: BadgesService,
  ) {}

  async findAll(
    userId?: number,
    kategorie?: string,
    search?: string,
    sort?: string,
    cursor?: number,
    limit: number = 20,
  ): Promise<{ witze: WitzResponse[]; nextCursor: number | null }> {
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'top')
      orderBy = [{ likeLikes: { _count: 'desc' } }, { id: 'desc' }];
    if (sort === 'comments')
      orderBy = [{ comments: { _count: 'desc' } }, { id: 'desc' }];

    const witze = await this.prisma.witz.findMany({
      take: limit + 1, // 1 extra um zu prüfen ob es mehr gibt
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      where: {
        ...(kategorie
          ? { kategorie: { name: { equals: kategorie, mode: 'insensitive' } } }
          : {}),
        ...(search ? { text: { contains: search, mode: 'insensitive' } } : {}),
      },
      select: {
        id: true,
        text: true,
        authorId: true,
        kategorieId: true,
        likes: true,
        createdAt: true,
        author: { select: { username: true, isBlueVerified: true } },
        kategorie: { select: { name: true, emoji: true } },
        _count: { select: { likeLikes: true, comments: true } },
        likeLikes: userId
          ? { where: { userId }, select: { id: true } }
          : undefined,
      },
      orderBy,
    });

    // Prüfen ob es mehr gibt
    const hasMore = witze.length > limit;
    if (hasMore) witze.pop(); // Extra-Item entfernen

    const nextCursor = hasMore ? witze[witze.length - 1].id : null;

    return {
      witze: witze.map((w) => ({
        ...w,
        likes: w._count.likeLikes ?? w.likes ?? 0,
        userLiked: userId ? (w.likeLikes?.length ?? 0) > 0 : false,
        commentCount: w._count.comments ?? 0,
      })),
      nextCursor,
    };
  }

  async findRandom() {
    const count = await this.prisma.witz.count();
    if (count === 0) return null;
    const skip = Math.floor(Math.random() * count);
    return this.prisma.witz.findFirst({
      skip,
      include: {
        author: { select: { username: true, isBlueVerified: true } },
        kategorie: { select: { name: true, emoji: true } },
        _count: { select: { likeLikes: true } },
      },
    });
  }

  async create(text: string, authorId: number, kategorieId?: number | null) {
    const witz = await this.prisma.witz.create({
      data: {
        text,
        authorId,
        kategorieId: kategorieId ? Number(kategorieId) : null,
      },
      include: { kategorie: true, author: true },
    });

    // Streak aktualisieren
    await this.updateStreak(authorId);
    await this.badgeService.checkAndAwardBadges(authorId);

    return witz;
  }

  private async updateStreak(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { currentStreak: true, longestStreak: true, lastPostDate: true },
    });

    if (!user) return;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (user.lastPostDate) {
      const last = new Date(user.lastPostDate);
      const lastDay = new Date(
        last.getFullYear(),
        last.getMonth(),
        last.getDate(),
      );
      const diffDays = Math.round(
        (today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (diffDays === 0) return; // Heute schon gepostet
      if (diffDays === 1) {
        // Streak verlängern
        const newStreak = user.currentStreak + 1;
        await this.prisma.user.update({
          where: { id: userId },
          data: {
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, user.longestStreak),
            lastPostDate: now,
          },
        });
      } else {
        // Streak gebrochen
        await this.prisma.user.update({
          where: { id: userId },
          data: { currentStreak: 1, lastPostDate: now },
        });
      }
    } else {
      // Erster Post
      await this.prisma.user.update({
        where: { id: userId },
        data: { currentStreak: 1, longestStreak: 1, lastPostDate: now },
      });
    }
  }

  async findByUser(userId: number) {
    return this.prisma.witz.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, userId?: number) {
    const witz = await this.prisma.witz.findUnique({
      where: { id },
      include: {
        author: {
          select: { username: true, email: true, isBlueVerified: true },
        },
        kategorie: true,
        _count: { select: { likeLikes: true } },
        likeLikes: {
          select: {
            userId: true,
            user: { select: { username: true } },
          },
          orderBy: { id: 'desc' },
          take: 3,
        },
      },
    });

    if (!witz) throw new NotFoundException('Witz nicht gefunden');

    const likerNames = witz.likeLikes.map((l) => l.user.username);

    return {
      ...witz,
      likes: witz._count.likeLikes,
      userLiked: userId
        ? witz.likeLikes.some((l) => l.userId === userId)
        : false,
      likerNames,
    };
  }

  async remove(id: number, userId: number) {
    const witz = await this.prisma.witz.findUnique({ where: { id } });

    if (!witz) throw new NotFoundException('Witz nicht gefunden');
    if (witz.authorId !== userId)
      throw new ForbiddenException('Nicht dein Witz');

    await this.prisma.like.deleteMany({ where: { witzId: id } });
    return this.prisma.witz.delete({ where: { id } });
  }

  async like(id: number, userId: number): Promise<LikeResponse> {
    const existingLike = await this.prisma.like.findUnique({
      where: { userId_witzId: { userId, witzId: id } },
    });

    if (existingLike) {
      await this.prisma.like.delete({ where: { id: existingLike.id } });
      const witz = await this.prisma.witz.update({
        where: { id },
        data: { likes: { decrement: 1 } },
      });
      return { liked: false, likes: witz.likes };
    }

    await this.prisma.like.create({ data: { userId, witzId: id } });
    const witz = await this.prisma.witz.update({
      where: { id },
      data: { likes: { increment: 1 } },
      include: { author: { select: { username: true } } },
    });

    // Notification für Witz-Autor
    if (witz.authorId && witz.authorId !== userId) {
      const liker = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { username: true },
      });
      await this.notificationsService.createNotification(
        witz.authorId,
        'like',
        `@${liker?.username} hat deinen Witz geliked`,
        id,
      );
    }

    return { liked: true, likes: witz.likes };
  }

  async findAllKategorien() {
    return this.prisma.kategorie.findMany({
      select: { id: true, name: true, emoji: true },
    });
  }

  async getLeaderboard() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        isBlueVerified: true,
        _count: {
          select: {
            witze: true,
            likes: true,
          },
        },
        witze: {
          select: {
            _count: {
              select: { likeLikes: true },
            },
          },
        },
      },
    });

    return users
      .map((u) => ({
        id: u.id,
        username: u.username,
        isBlueVerified: u.isBlueVerified,
        witzeCount: u._count.witze,
        likesReceived: u.witze.reduce((sum, w) => sum + w._count.likeLikes, 0),
      }))
      .sort((a, b) => b.likesReceived - a.likesReceived)
      .slice(0, 10);
  }

  async report(witzId: number, userId: number, reason: string) {
    return this.prisma.report.create({
      data: { witzId, userId, reason },
    });
  }
}
