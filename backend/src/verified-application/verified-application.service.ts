import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VerifiedApplicationService {
  constructor(private readonly prisma: PrismaService) {}

  // Benutzer reicht Bewerbung ein
  async apply(userId: number, message?: string) {
    // Prüfen ob User Meister-Badge hat
    const meisterBadge = await this.prisma.badge.findUnique({
      where: { userId_key: { userId, key: 'meister' } },
    });
    if (!meisterBadge) {
      throw new ForbiddenException(
        'Du benötigst den Meister-Badge um dich für Verified zu bewerben.',
      );
    }

    // Prüfen ob bereits verifiziert
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { isBlueVerified: true },
    });
    if (user?.isBlueVerified) {
      throw new BadRequestException('Du bist bereits verifiziert.');
    }

    // Prüfen ob bereits eine aktive/abgelehnte Bewerbung existiert
    const existing = await this.prisma.verifiedApplication.findUnique({
      where: { userId },
    });
    if (existing) {
      if (existing.status === 'PENDING') {
        throw new BadRequestException(
          'Du hast bereits eine ausstehende Bewerbung.',
        );
      }
      if (existing.status === 'APPROVED') {
        throw new BadRequestException(
          'Deine Bewerbung wurde bereits genehmigt.',
        );
      }
      // Bei REJECTED: alte Bewerbung löschen und neue einreichen
      await this.prisma.verifiedApplication.delete({ where: { userId } });
    }

    return this.prisma.verifiedApplication.create({
      data: { userId, message },
    });
  }

  // Eigene Bewerbung abrufen
  async getMyApplication(userId: number) {
    return this.prisma.verifiedApplication.findUnique({
      where: { userId },
      include: {
        admin: { select: { id: true, username: true } },
      },
    });
  }

  // Bewerbung zurückziehen
  async withdraw(userId: number) {
    const app = await this.prisma.verifiedApplication.findUnique({
      where: { userId },
    });
    if (!app) throw new NotFoundException('Keine Bewerbung gefunden.');
    if (app.status !== 'PENDING') {
      throw new BadRequestException(
        'Nur ausstehende Bewerbungen können zurückgezogen werden.',
      );
    }
    return this.prisma.verifiedApplication.delete({ where: { userId } });
  }

  // Admin: Alle Bewerbungen abrufen
  async getAllApplications(status?: string) {
    return this.prisma.verifiedApplication.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            createdAt: true,
            badges: { select: { key: true } },
            _count: { select: { witze: true } },
          },
        },
        admin: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // Admin: Bewerbung genehmigen
  async approve(applicationId: number, adminId: number) {
    const app = await this.prisma.verifiedApplication.findUnique({
      where: { id: applicationId },
    });
    if (!app) throw new NotFoundException('Bewerbung nicht gefunden.');
    if (app.status !== 'PENDING') {
      throw new BadRequestException('Bewerbung ist nicht ausstehend.');
    }

    // Transaktion: Status updaten + User als verified markieren
    const [updatedApp] = await this.prisma.$transaction([
      this.prisma.verifiedApplication.update({
        where: { id: applicationId },
        data: {
          status: 'APPROVED',
          reviewedBy: adminId,
          reviewedAt: new Date(),
        },
      }),
      this.prisma.user.update({
        where: { id: app.userId },
        data: { isBlueVerified: true },
      }),
    ]);

    return updatedApp;
  }

  // Admin: Bewerbung ablehnen
  async reject(applicationId: number, adminId: number, adminNote?: string) {
    const app = await this.prisma.verifiedApplication.findUnique({
      where: { id: applicationId },
    });
    if (!app) throw new NotFoundException('Bewerbung nicht gefunden.');
    if (app.status !== 'PENDING') {
      throw new BadRequestException('Bewerbung ist nicht ausstehend.');
    }

    return this.prisma.verifiedApplication.update({
      where: { id: applicationId },
      data: {
        status: 'REJECTED',
        reviewedBy: adminId,
        reviewedAt: new Date(),
        adminNote,
      },
    });
  }
}
