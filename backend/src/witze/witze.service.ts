import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WitzeService {
  constructor(private prisma: PrismaService) { }

  async findAll(userId?: number) {  // ← userId Parameter!
    return this.prisma.witz.findMany({
      include: {
        author: { select: { username: true } },
        kategorie: { select: { name: true, emoji: true } },
        _count: { select: { likeLikes: true } },
        likeLikes: userId
          ? { where: { userId }, select: { id: true } }
          : false
      },
      orderBy: { createdAt: 'desc' },
    }).then(witze => witze.map(w => ({
      ...w,
      likes: w._count.likeLikes,
      userLiked: userId && w.likeLikes.length > 0
    })));
  }


  async findRandom() {
    return this.prisma.witz.findFirst({
      orderBy: { id: 'desc' },
    });
  }

  async create(text: string, authorId: number, kategorieId?: number) {
    return this.prisma.witz.create({
      data: { text, authorId, kategorieId },
      include: { kategorie: true, author: true },
    });
  }

  // Eigene Witze des eingeloggten Users
  async findByUser(userId: number) {
    return this.prisma.witz.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Witz löschen (nur eigene)
  async remove(id: number, userId: number) {
    const witz = await this.prisma.witz.findUnique({ where: { id } });
    if (!witz) throw new NotFoundException('Witz nicht gefunden');
    if (witz.authorId !== Number(userId))
      throw new ForbiddenException('Nicht dein Witz');

    // 🔥 LIKES ZUERST LÖSCHEN!
    await this.prisma.like.deleteMany({ where: { witzId: id } });

    return this.prisma.witz.delete({ where: { id } });
  }


  async like(id: number, userId: number) {
    const existingLike = await this.prisma.like.findUnique({
      where: { userId_witzId: { userId, witzId: id } },
    });

    if (existingLike) {
      // Unlike
      await this.prisma.like.delete({ where: { id: existingLike.id } });
      await this.prisma.witz.update({
        where: { id },
        data: { likes: { decrement: 1 } },
      });
      return {
        liked: false,
        likes: (await this.prisma.witz.findUnique({ where: { id } }))!.likes,
      };
    } else {
      // Like
      await this.prisma.like.create({ data: { userId, witzId: id } });
      await this.prisma.witz.update({
        where: { id },
        data: { likes: { increment: 1 } },
      });
      return {
        liked: true,
        likes: (await this.prisma.witz.findUnique({ where: { id } }))!.likes,
      };
    }
  }

  async getProfile(userId: number) {
    const [witze, likesReceived, user] = await Promise.all([
      this.findByUser(userId),
      this.prisma.like.count({ where: { witz: { authorId: userId } } }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { username: true, email: true }
      })
    ]);

    const rang = this.getRang(likesReceived);

    return {
      witze,
      likesReceived,
      rang,
      username: user?.username || 'Unbekannt',  // ✅ Fix!
      email: user?.email || ''                  // ✅ Fix!
    };
  }



  private getRang(likes: number): string {
    if (likes >= 100) return '👑 Legende';
    if (likes >= 50) return '🥇 Gold';
    if (likes >= 10) return '🥈 Silber';
    return '🥉 Neuling';
  }

  async findOne(id: number, userId?: number) {
    const witz = await this.prisma.witz.findUnique({
      where: { id },
      include: {
        author: { select: { username: true, email: true } },
        kategorie: true,
        _count: { select: { likeLikes: true } },
        likeLikes: userId ? { where: { userId }, select: { id: true } } : false
      }
    });

    if (!witz) throw new NotFoundException('Witz nicht gefunden');

    return {
      ...witz,
      likes: witz._count.likeLikes,
      userLiked: userId && witz.likeLikes.length > 0
    };
  }

  async findAllKategorien() {
    return this.prisma.kategorie.findMany({
      select: { id: true, name: true, emoji: true }
    });
  }

  async findUserWitze(userId: number | string) {
    const id = Number(userId);
    return this.prisma.witz.findMany({
      where: { authorId: id },
      include: { kategorie: true },
      orderBy: { createdAt: 'desc' }
    });
  }
}
