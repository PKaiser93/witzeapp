import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export const BADGE_DEFINITIONS = [
  {
    key: 'newcomer',
    emoji: '🌱',
    label: 'Neuankömmling',
    description: 'Willkommen!',
  },
  {
    key: 'first_witz',
    emoji: '📝',
    label: 'Erster Witz',
    description: '1 Witz gepostet',
  },
  {
    key: 'on_fire',
    emoji: '🔥',
    label: 'Auf Feuer',
    description: '7 Tage Streak',
  },
  {
    key: 'centurion',
    emoji: '💯',
    label: 'Centurion',
    description: '100 Witze gepostet',
  },
  {
    key: 'popular',
    emoji: '❤️',
    label: 'Beliebt',
    description: '10 Likes erhalten',
  },
  {
    key: 'star',
    emoji: '🏆',
    label: 'Star',
    description: '100 Likes erhalten',
  },
  { key: 'social', emoji: '👥', label: 'Sozial', description: '10 Follower' },
  {
    key: 'commenter',
    emoji: '💬',
    label: 'Kommentator',
    description: '10 Kommentare',
  },
];

@Injectable()
export class BadgesService {
  constructor(private readonly prisma: PrismaService) {}

  async checkAndAwardBadges(userId: number) {
    const [
      user,
      witzeCount,
      likesReceived,
      followerCount,
      commentCount,
      existingBadges,
    ] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { currentStreak: true },
      }),
      this.prisma.witz.count({ where: { authorId: userId } }),
      this.prisma.like.count({ where: { witz: { authorId: userId } } }),
      this.prisma.follow.count({ where: { followingId: userId } }),
      this.prisma.comment.count({ where: { authorId: userId } }),
      this.prisma.badge.findMany({ where: { userId }, select: { key: true } }),
    ]);

    const existing = new Set(existingBadges.map((b) => b.key));
    const toAward: string[] = [];

    if (!existing.has('newcomer')) toAward.push('newcomer');
    if (!existing.has('first_witz') && witzeCount >= 1)
      toAward.push('first_witz');
    if (!existing.has('on_fire') && (user?.currentStreak ?? 0) >= 7)
      toAward.push('on_fire');
    if (!existing.has('centurion') && witzeCount >= 100)
      toAward.push('centurion');
    if (!existing.has('popular') && likesReceived >= 10)
      toAward.push('popular');
    if (!existing.has('star') && likesReceived >= 100) toAward.push('star');
    if (!existing.has('social') && followerCount >= 10) toAward.push('social');
    if (!existing.has('commenter') && commentCount >= 10)
      toAward.push('commenter');

    if (toAward.length > 0) {
      await this.prisma.badge.createMany({
        data: toAward.map((key) => ({ userId, key })),
        skipDuplicates: true,
      });
    }

    return toAward;
  }

  async getUserBadges(userId: number) {
    const badges = await this.prisma.badge.findMany({
      where: { userId },
      orderBy: { awardedAt: 'asc' },
    });
    return badges.map((b) => ({
      ...b,
      ...BADGE_DEFINITIONS.find((d) => d.key === b.key),
    }));
  }
}
