import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';

export const BAN_DURATIONS: Record<string, number | null> = {
  '1h': 1 * 60 * 60 * 1000,
  '4h': 4 * 60 * 60 * 1000,
  '12h': 12 * 60 * 60 * 1000,
  '1d': 1 * 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '14d': 14 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
  '1y': 365 * 24 * 60 * 60 * 1000,
  permanent: null,
};

@Injectable()
export class BanService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async deleteWarning(warningId: number, adminId: number) {
    const warning = await this.prisma.warning.findUnique({
      where: { id: warningId },
      include: { user: { select: { username: true } } },
    });
    if (!warning) throw new Error('Verwarnung nicht gefunden');

    await this.auditService.log(
      adminId,
      'DELETE_WARNING',
      'Warning',
      warningId,
      `Verwarnung von @${warning.user.username} gelöscht`,
    );

    return this.prisma.warning.delete({ where: { id: warningId } });
  }

  async banUser(
    userId: number,
    adminId: number,
    reason: string,
    duration: string,
  ) {
    const target = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });

    const ms = BAN_DURATIONS[duration];
    const expiresAt = ms ? new Date(Date.now() + ms) : null;

    const ban = await this.prisma.ban.upsert({
      where: { userId },
      update: {
        reason,
        bannedBy: adminId,
        bannedAt: new Date(),
        expiresAt,
        active: true,
      },
      create: { userId, reason, bannedBy: adminId, expiresAt },
    });

    await this.auditService.log(
      adminId,
      'BAN_USER',
      'User',
      userId,
      `@${target?.username} gebannt für ${duration} – Grund: ${reason}`,
    );

    return ban;
  }

  async unbanUser(userId: number, adminId: number) {
    const target = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });

    await this.prisma.ban.update({
      where: { userId },
      data: { active: false },
    });

    await this.auditService.log(
      adminId,
      'UNBAN_USER',
      'User',
      userId,
      `@${target?.username} entbannt`,
    );

    return { success: true };
  }

  async warnUser(userId: number, adminId: number, reason: string) {
    const target = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });

    const warning = await this.prisma.warning.create({
      data: { userId, warnedBy: adminId, reason },
    });

    // Notification
    await this.notificationsService.createNotification(
      userId,
      'warning',
      `Du hast eine Verwarnung erhalten: ${reason}`,
    );

    await this.auditService.log(
      adminId,
      'WARN_USER',
      'User',
      userId,
      `@${target?.username} verwarnt – Grund: ${reason}`,
    );

    return warning;
  }

  async getWarnings(userId: number) {
    return this.prisma.warning.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { admin: { select: { username: true } } },
    });
  }

  async getBanStatus(userId: number) {
    const ban = await this.prisma.ban.findUnique({ where: { userId } });
    if (!ban || !ban.active) return { banned: false };

    // Abgelaufenen Ban automatisch deaktivieren
    if (ban.expiresAt && ban.expiresAt < new Date()) {
      await this.prisma.ban.update({
        where: { userId },
        data: { active: false },
      });
      return { banned: false };
    }

    return {
      banned: true,
      reason: ban.reason,
      expiresAt: ban.expiresAt,
      permanent: ban.expiresAt === null,
    };
  }
}
