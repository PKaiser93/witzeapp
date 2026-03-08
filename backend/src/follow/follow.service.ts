import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class FollowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async toggleFollow(followerId: number, followingId: number) {
    if (followerId === followingId)
      throw new Error('Du kannst dir nicht selbst folgen');

    const existing = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });

    if (existing) {
      await this.prisma.follow.delete({ where: { id: existing.id } });
      return { following: false };
    }

    await this.prisma.follow.create({ data: { followerId, followingId } });

    // Notification
    const follower = await this.prisma.user.findUnique({
      where: { id: followerId },
      select: { username: true },
    });
    await this.notificationsService.createNotification(
      followingId,
      'follow',
      `@${follower?.username} folgt dir jetzt`,
    );

    return { following: true };
  }

  async isFollowing(followerId: number, followingId: number) {
    const existing = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });
    return { following: !!existing };
  }

  async getFollowCounts(userId: number) {
    const [followers, following] = await Promise.all([
      this.prisma.follow.count({ where: { followingId: userId } }),
      this.prisma.follow.count({ where: { followerId: userId } }),
    ]);
    return { followers, following };
  }

  async getFollowingFeed(userId: number) {
    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    const followingIds = following.map((f) => f.followingId);

    return this.prisma.witz.findMany({
      where: { authorId: { in: followingIds } },
      include: {
        author: { select: { username: true } },
        kategorie: { select: { name: true, emoji: true } },
        _count: { select: { likeLikes: true, comments: true } },
        likeLikes: { where: { userId }, select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
