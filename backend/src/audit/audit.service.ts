import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(
    adminId: number,
    action: string,
    entity: string,
    entityId?: number,
    details?: string,
  ) {
    return this.prisma.auditLog.create({
      data: { adminId, action, entity, entityId, details },
    });
  }

  async getLogs(limit = 100) {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        admin: { select: { username: true } },
      },
    });
  }

  async clearOldLogs() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return this.prisma.auditLog.deleteMany({
      where: { createdAt: { lt: thirtyDaysAgo } },
    });
  }
}
