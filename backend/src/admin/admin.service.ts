import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async updateUserRole(userId: number, role: string, adminId: number) {
    // Admin kann sich nicht selbst degradieren
    if (userId === adminId && role !== 'ADMIN') {
      throw new ForbiddenException(
        'Du kannst deine eigene Admin-Rolle nicht entfernen',
      );
    }

    const target = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });

    const result = await this.prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
      select: { id: true, username: true, role: true },
    });

    await this.auditService.log(
      adminId,
      'UPDATE_ROLE',
      'User',
      userId,
      `@${target?.username} → Rolle geändert zu ${role}`,
    );

    return result;
  }

  async deleteUser(userId: number, adminId: number) {
    const target = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });

    await this.auditService.log(
      adminId,
      'DELETE_USER',
      'User',
      userId,
      `@${target?.username} gelöscht`,
    );

    return this.prisma.user.delete({ where: { id: userId } });
  }

  async resolveReport(reportId: number, adminId: number) {
    await this.auditService.log(adminId, 'RESOLVE_REPORT', 'Report', reportId);
    return this.prisma.report.update({
      where: { id: reportId },
      data: { resolved: true },
    });
  }

  async deleteReportedWitz(witzId: number, adminId: number) {
    await this.auditService.log(
      adminId,
      'DELETE_WITZ',
      'Witz',
      witzId,
      'Witz durch Meldung gelöscht',
    );
    await this.prisma.report.deleteMany({ where: { witzId } });
    await this.prisma.like.deleteMany({ where: { witzId } });
    return this.prisma.witz.delete({ where: { id: witzId } });
  }

  async getLogs() {
    return this.auditService.getLogs();
  }

  async getStats() {
    const [userCount, witzCount, commentCount, likeCount] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.witz.count(),
      this.prisma.comment.count(),
      this.prisma.like.count(),
    ]);
    return { userCount, witzCount, commentCount, likeCount };
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        _count: { select: { witze: true, comments: true } },
        ban: {
          select: { active: true, expiresAt: true, reason: true },
        },
      },
      orderBy: { id: 'asc' },
    });
  }

  async getConfig() {
    return this.prisma.appConfig.findMany({
      orderBy: { key: 'asc' },
    });
  }

  async updateConfig(key: string, value: string) {
    return this.prisma.appConfig.update({
      where: { key },
      data: { value },
    });
  }

  async getReports() {
    return this.prisma.report.findMany({
      where: { resolved: false },
      include: {
        witz: { select: { id: true, text: true, authorId: true } },
        user: { select: { username: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
