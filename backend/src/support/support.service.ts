import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class SupportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  private generateTicketId() {
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `WTZ-${date}-${rand}`;
  }

  async createMessage(subject: string, message: string, email?: string | null) {
    const ticketId = this.generateTicketId();

    await this.prisma.supportMessage.create({
      data: {
        ticketId,
        subject,
        message,
        email: email || null,
      },
    });

    if (email) {
      await this.mailService.sendSupportTicketConfirmation(
        email,
        subject,
        message,
        ticketId,
      );
    }

    return { success: true, ticketId };
  }

  async findAll(params: {
    status?: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
    skip?: number;
    take?: number;
  }) {
    const { status, skip = 0, take = 50 } = params;
    return this.prisma.supportMessage.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
  }

  async findByTicketId(ticketId: string) {
    return this.prisma.supportMessage.findUnique({
      where: { ticketId },
    });
  }

  async updateStatus(id: number, status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED') {
    return this.prisma.supportMessage.update({
      where: { id },
      data: { status },
    });
  }

  async findOne(id: number) {
    return this.prisma.supportMessage.findUnique({ where: { id } });
  }
}
