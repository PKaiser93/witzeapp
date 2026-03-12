// src/admin/admin.service.ts
import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AdminUserResponseDto } from './dto/admin-user-response.dto';
import { ConfigResponseDto } from './dto/config-response.dto';
import { ReportResponseDto } from './dto/report-response.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async updateUserRole(
    userId: number,
    role: Role,
    adminId: number,
  ): Promise<AdminUserResponseDto> {
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
      data: { role },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { witze: true } },
      },
    });

    await this.auditService.log(
      adminId,
      'UPDATE_ROLE',
      'User',
      userId,
      `@${target?.username} → Rolle geändert zu ${role}`,
    );

    return new AdminUserResponseDto({
      id: result.id,
      username: result.username,
      email: result.email,
      role: result.role,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      jokesCount: result._count.witze,
    });
  }

  async deleteUser(userId: number, adminId: number): Promise<void> {
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

    await this.prisma.user.delete({ where: { id: userId } });
  }

  async resolveReport(
    reportId: number,
    adminId: number,
  ): Promise<ReportResponseDto> {
    await this.auditService.log(adminId, 'RESOLVE_REPORT', 'Report', reportId);

    const report = await this.prisma.report.update({
      where: { id: reportId },
      data: { resolved: true },
      include: {
        witz: { select: { id: true, authorId: true } },
      },
    });

    return new ReportResponseDto({
      id: report.id,
      witzId: report.witzId,
      reporterId: report.userId,
      reportedUserId: report.witz?.authorId ?? null,
      reason: report.reason,
      createdAt: report.createdAt,
      resolved: report.resolved,
    });
  }

  async deleteReportedWitz(witzId: number, adminId: number): Promise<void> {
    await this.auditService.log(
      adminId,
      'DELETE_WITZ',
      'Witz',
      witzId,
      'Witz durch Meldung gelöscht',
    );
    await this.prisma.report.deleteMany({ where: { witzId } });
    await this.prisma.like.deleteMany({ where: { witzId } });
    await this.prisma.witz.delete({ where: { id: witzId } });
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

  async getAllUsers(): Promise<AdminUserResponseDto[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            witze: true,
            comments: true,
          },
        },
        ban: {
          select: { active: true, expiresAt: true, reason: true },
        },
      },
      orderBy: { id: 'asc' },
    });

    return users.map(
      (u) =>
        new AdminUserResponseDto({
          id: u.id,
          username: u.username,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
          jokesCount: u._count.witze,
          commentsCount: u._count.comments,
          ban: u.ban, // <- wichtig
        }),
    );
  }

  async getConfig(): Promise<ConfigResponseDto[]> {
    const configs = await this.prisma.appConfig.findMany({
      orderBy: { key: 'asc' },
    });

    return configs.map(
      (c) =>
        new ConfigResponseDto({
          key: c.key,
          value: c.value,
        }),
    );
  }

  async updateConfig(key: string, value: string): Promise<ConfigResponseDto> {
    const config = await this.prisma.appConfig.update({
      where: { key },
      data: { value },
    });

    return new ConfigResponseDto({
      key: config.key,
      value: config.value,
    });
  }

  async getReports() {
    const reports = await this.prisma.report.findMany({
      where: {
        resolved: false,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        witz: { select: { id: true, text: true, authorId: true } },
        user: { select: { username: true } },
      },
    });

    return reports.map((r) => ({
      id: r.id,
      reason: r.reason,
      createdAt: r.createdAt,
      witz: r.witz
        ? {
            id: r.witz.id,
            text: r.witz.text,
            authorId: r.witz.authorId,
          }
        : null,
      user: r.user ? { username: r.user.username } : null,
    }));
  }
}
