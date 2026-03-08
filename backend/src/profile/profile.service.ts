import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { BadgesService } from '../badges/badges.service';

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
  role: string;
  bio: string;
  id: number;
  currentStreak: number;
  longestStreak: number;
}

function calculateRang(likesReceived: number): string {
  if (likesReceived >= 500) return '👑 König der Witze';
  if (likesReceived >= 250) return '🌟 Legende';
  if (likesReceived >= 100) return '🏆 Meister';
  if (likesReceived >= 50) return '💎 Experte';
  if (likesReceived >= 25) return '🥇 Fortgeschrittener';
  if (likesReceived >= 10) return '🥈 Aufsteiger';
  return '🥉 Neuling';
}

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly badgeService: BadgesService,
  ) {}

  async getBadges(userId: number) {
    return this.badgeService.getUserBadges(userId);
  }

  async getUserByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    if (!user) throw new NotFoundException('User nicht gefunden');
    return user;
  }

  async getProfile(userId: number): Promise<ProfileResponse> {
    const [witzeRaw, likesReceived, user] = await Promise.all([
      this.prisma.witz.findMany({
        where: { authorId: userId },
        select: {
          id: true,
          text: true,
          likes: true,
          createdAt: true,
          updatedAt: true,
          isEdited: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.like.count({ where: { witz: { authorId: userId } } }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          username: true,
          email: true,
          role: true,
          bio: true,
          currentStreak: true,
          longestStreak: true,
        },
      }),
    ]);

    const witze: ProfileWitz[] = witzeRaw.map((w) => ({
      ...w,
      isEdited: w.isEdited, // ← aus DB lesen
    }));

    const rang = calculateRang(likesReceived);

    return {
      id: userId,
      witze,
      likesReceived,
      rang,
      username: user?.username ?? 'Unbekannt',
      email: user?.email ?? '',
      role: user?.role ?? 'USER',
      bio: user?.bio ?? '',
      currentStreak: user?.currentStreak ?? 0,
      longestStreak: user?.longestStreak ?? 0,
    };
  }

  async deleteWitz(
    witzId: number,
    userId: number,
  ): Promise<{ message: string }> {
    const witz = await this.prisma.witz.findUnique({ where: { id: witzId } });

    if (!witz) throw new NotFoundException('Witz nicht gefunden');
    if (witz.authorId !== userId)
      throw new ForbiddenException('Nicht dein Witz!');

    await this.prisma.witz.delete({ where: { id: witzId } });
    return { message: 'Witz gelöscht' };
  }

  async updateWitz(witzId: number, text: string, userId: number) {
    const witz = await this.prisma.witz.findUnique({ where: { id: witzId } });

    if (!witz) throw new NotFoundException('Witz nicht gefunden');
    if (witz.authorId !== userId)
      throw new ForbiddenException('Nicht dein Witz!');

    // ✅
    const updated = await this.prisma.witz.update({
      where: { id: witzId },
      data: { text, isEdited: true },
      select: {
        id: true,
        text: true,
        updatedAt: true,
        createdAt: true,
        isEdited: true,
      },
    });

    return { ...updated, isEdited: true };
  }

  async getWarnings(userId: number) {
    return this.prisma.warning.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        reason: true,
        createdAt: true,
        admin: { select: { username: true } },
      },
    });
  }

  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) throw new NotFoundException('User nicht gefunden');

    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) throw new ForbiddenException('Altes Passwort ist falsch');

    if (newPassword.length < 6) {
      throw new ForbiddenException(
        'Neues Passwort muss mindestens 6 Zeichen lang sein',
      );
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    return { success: true };
  }

  async deleteAccount(userId: number) {
    return this.prisma.user.delete({ where: { id: userId } });
  }

  async changeUsername(userId: number, newUsername: string) {
    const trimmed = newUsername.trim();

    if (!trimmed)
      throw new BadRequestException('Username darf nicht leer sein');
    if (trimmed.length < 3)
      throw new BadRequestException(
        'Username muss mindestens 3 Zeichen lang sein',
      );
    if (trimmed.length > 20)
      throw new BadRequestException(
        'Username darf maximal 20 Zeichen lang sein',
      );
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed))
      throw new BadRequestException(
        'Username darf nur Buchstaben, Zahlen und _ enthalten',
      );

    // Prüfen ob Username verfügbar
    const existing = await this.prisma.user.findUnique({
      where: { username: trimmed },
      select: { id: true },
    });
    if (existing) throw new BadRequestException('Username bereits vergeben');

    return this.prisma.user.update({
      where: { id: userId },
      data: { username: trimmed },
      select: { id: true, username: true },
    });
  }

  async updateBio(userId: number, bio: string) {
    if (bio.length > 160)
      throw new BadRequestException('Bio darf maximal 160 Zeichen lang sein');
    return this.prisma.user.update({
      where: { id: userId },
      data: { bio: bio.trim() },
      select: { id: true, bio: true },
    });
  }

  async getPublicProfile(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        bio: true,
        role: true,
        createdAt: true,
        currentStreak: true,
        longestStreak: true,
        witze: {
          include: {
            kategorie: { select: { name: true, emoji: true } },
            _count: { select: { likeLikes: true, comments: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) throw new NotFoundException('User nicht gefunden');

    const likesReceived = user.witze.reduce(
      (sum, w) => sum + w._count.likeLikes,
      0,
    );

    const rang = calculateRang(likesReceived);

    return {
      id: user.id,
      username: user.username,
      bio: user.bio ?? '',
      role: user.role,
      rang,
      memberSince: user.createdAt,
      witzeCount: user.witze.length,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      likesReceived,
      witze: user.witze.map((w) => ({
        id: w.id,
        text: w.text,
        likes: w._count.likeLikes,
        createdAt: w.createdAt,
        isEdited: w.isEdited,
        kategorie: w.kategorie,
      })),
    };
  }

  async exportData(userId: number) {
    const [
      user,
      witze,
      kommentare,
      likes,
      badges,
      warnings,
      followers,
      following,
    ] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          email: true,
          bio: true,
          role: true,
          createdAt: true,
        },
      }),
      this.prisma.witz.findMany({
        where: { authorId: userId },
        select: { id: true, text: true, likes: true, createdAt: true },
      }),
      this.prisma.comment.findMany({
        where: { authorId: userId },
        select: { id: true, text: true, createdAt: true, witzId: true },
      }),
      this.prisma.like.findMany({
        where: { userId },
        select: { id: true, witzId: true },
      }),
      this.prisma.badge.findMany({
        where: { userId },
        select: { key: true, awardedAt: true },
      }),
      this.prisma.warning.findMany({
        where: { userId },
        select: { reason: true, createdAt: true },
      }),
      this.prisma.follow.count({ where: { followingId: userId } }),
      this.prisma.follow.count({ where: { followerId: userId } }),
    ]);

    return {
      exportDatum: new Date().toISOString(),
      hinweis: 'Datenexport gemäß Art. 20 DSGVO',
      profil: user,
      statistiken: {
        anzahlWitze: witze.length,
        anzahlKommentare: kommentare.length,
        anzahlLikes: likes.length,
        followers,
        following,
      },
      witze,
      kommentare,
      likes,
      badges,
      verwarnungen: warnings,
    };
  }
}
