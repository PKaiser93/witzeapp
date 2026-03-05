import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KategorieService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.kategorie.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async create(name: string, emoji: string) {
    return this.prisma.kategorie.create({
      data: { name, emoji },
    });
  }
}
