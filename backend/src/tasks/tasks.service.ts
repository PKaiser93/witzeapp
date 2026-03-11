import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Täglich um 03:00 Uhr
  @Cron('0 3 * * *')
  async cleanupOldLogs() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deleted = await this.prisma.auditLog.deleteMany({
      where: { createdAt: { lt: thirtyDaysAgo } },
    });

    this.logger.log(`🧹 Audit-Log Cleanup: ${deleted.count} Einträge gelöscht`);
  }

  // Täglich um 03:30 Uhr – abgelaufene Bans deaktivieren
  @Cron('30 3 * * *')
  async deactivateExpiredBans() {
    const now = new Date();
    const updated = await this.prisma.ban.updateMany({
      where: {
        active: true,
        expiresAt: { lt: now },
      },
      data: { active: false },
    });

    this.logger.log(`🔓 Expired Bans: ${updated.count} Bans deaktiviert`);
  }

  // Wöchentlich sonntags um 04:00 Uhr – alte Benachrichtigungen löschen
  @Cron('0 4 * * 0')
  async cleanupOldNotifications() {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const deleted = await this.prisma.notification.deleteMany({
      where: {
        read: true,
        createdAt: { lt: ninetyDaysAgo },
      },
    });

    this.logger.log(
      `🔔 Notification Cleanup: ${deleted.count} Benachrichtigungen gelöscht`,
    );
  }

  @Cron('0 4 * * *')
  async cleanupBlacklistedTokens() {
    const deleted = await this.prisma.blacklistedToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    this.logger.log(`🗑️ Blacklist Cleanup: ${deleted.count} Tokens gelöscht`);
  }
}
