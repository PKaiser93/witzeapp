import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findByWitz(witzId: number) {
    return this.prisma.comment.findMany({
      where: { witzId },
      include: { author: { select: { username: true, isBlueVerified: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(text: string, authorId: number, witzId: number) {
    const comment = await this.prisma.comment.create({
      data: { text, authorId, witzId },
      include: { author: { select: { username: true } } },
    });

    // Notification für den Witz-Autor erstellen
    const witz = await this.prisma.witz.findUnique({
      where: { id: witzId },
      select: { authorId: true },
    });

    if (witz?.authorId && witz.authorId !== authorId) {
      await this.notificationsService.createNotification(
        witz.authorId,
        'comment',
        `@${comment.author.username} hat deinen Witz kommentiert`,
        witzId,
      );
    }

    return comment;
  }

  async remove(id: number, userId: number) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new Error('Kommentar nicht gefunden');
    if (comment.authorId !== userId) throw new Error('Nicht dein Kommentar');
    return this.prisma.comment.delete({ where: { id } });
  }
}
