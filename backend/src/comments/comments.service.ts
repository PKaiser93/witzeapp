import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByWitz(witzId: number) {
    return this.prisma.comment.findMany({
      where: { witzId },
      include: { author: { select: { username: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(text: string, authorId: number, witzId: number) {
    return this.prisma.comment.create({
      data: { text, authorId, witzId },
      include: { author: { select: { username: true } } },
    });
  }

  async remove(id: number, userId: number) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) throw new Error('Kommentar nicht gefunden');
    if (comment.authorId !== userId) throw new Error('Nicht dein Kommentar');
    return this.prisma.comment.delete({ where: { id } });
  }
}
