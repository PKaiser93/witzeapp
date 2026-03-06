import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface WitzResponse {
  id: number;
  text: string;
  authorId: number | null;
  kategorieId: number | null;
  likes: number;
  createdAt: Date;
  userLiked: boolean;
  author?: { username: string } | null; // ← | null ergänzen
  kategorie?: { name: string; emoji: string } | null; // ← | null ergänzen
  commentCount?: number;
}

export interface LikeResponse {
  liked: boolean;
  likes: number;
}

@Injectable()
export class WitzeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId?: number, kategorie?: string): Promise<WitzResponse[]> {
    const witze = await this.prisma.witz.findMany({
      where: kategorie
        ? { kategorie: { name: { equals: kategorie, mode: 'insensitive' } } }
        : undefined,
      select: {
        id: true,
        text: true,
        authorId: true,
        kategorieId: true,
        likes: true,
        createdAt: true,
        author: { select: { username: true } },
        kategorie: { select: { name: true, emoji: true } },
        _count: { select: { likeLikes: true, comments: true } },
        likeLikes: userId
          ? { where: { userId }, select: { id: true } }
          : undefined,
      },
      orderBy: { createdAt: 'desc' },
    });

    return witze.map((w) => ({
      ...w,
      likes: w._count.likeLikes ?? w.likes ?? 0,
      userLiked: userId ? (w.likeLikes?.length ?? 0) > 0 : false,
      commentCount: w._count.comments ?? 0,
    }));
  }

  async findRandom() {
    const count = await this.prisma.witz.count();
    if (count === 0) return null;
    const skip = Math.floor(Math.random() * count);
    return this.prisma.witz.findFirst({
      skip,
      include: {
        author: { select: { username: true } },
        kategorie: { select: { name: true, emoji: true } },
        _count: { select: { likeLikes: true } },
      },
    });
  }

  async create(text: string, authorId: number, kategorieId?: number | null) {
    return this.prisma.witz.create({
      data: {
        text,
        authorId,
        kategorieId: kategorieId ? Number(kategorieId) : null, // ← Number() ergänzen
      },
      include: { kategorie: true, author: true },
    });
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
        author: { select: { username: true, email: true } },
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
    });
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
        witzeCount: u._count.witze,
        likesReceived: u.witze.reduce((sum, w) => sum + w._count.likeLikes, 0),
      }))
      .sort((a, b) => b.likesReceived - a.likesReceived)
      .slice(0, 10);
  }
}
