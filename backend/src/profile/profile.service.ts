import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

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
}

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

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
          isEdited: true, // ← ergänzen
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.like.count({ where: { witz: { authorId: userId } } }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { username: true, email: true, role: true },
      }),
    ]);

    const witze: ProfileWitz[] = witzeRaw.map((w) => ({
      ...w,
      isEdited: w.isEdited, // ← aus DB lesen
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
      role: user?.role ?? 'USER',
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
}
