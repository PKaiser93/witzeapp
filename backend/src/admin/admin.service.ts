import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

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
      },
      orderBy: { id: 'asc' },
    });
  }

  async updateUserRole(userId: number, role: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
      select: { id: true, username: true, role: true },
    });
  }

  async deleteUser(userId: number) {
    return this.prisma.user.delete({ where: { id: userId } });
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

  async resolveReport(reportId: number) {
    return this.prisma.report.update({
      where: { id: reportId },
      data: { resolved: true },
    });
  }

  async deleteReportedWitz(witzId: number) {
    await this.prisma.report.deleteMany({ where: { witzId } });
    await this.prisma.like.deleteMany({ where: { witzId } });
    return this.prisma.witz.delete({ where: { id: witzId } });
  }
}
