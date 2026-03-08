import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface Kategorie {
  id: number;
  name: string;
  emoji: string;
}

@Injectable()
export class KategorieService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Kategorie[]> {
    return this.prisma.kategorie.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async create(name: string, emoji: string): Promise<Kategorie> {
    const trimmedName = name?.trim();
    const trimmedEmoji = emoji?.trim();

    if (!trimmedName) {
      throw new BadRequestException('Name darf nicht leer sein');
    }

    if (!trimmedEmoji) {
      throw new BadRequestException('Emoji darf nicht leer sein');
    }

    return this.prisma.kategorie.create({
      data: { name: trimmedName, emoji: trimmedEmoji },
    });
  }

  async update(id: number, name: string, emoji: string): Promise<Kategorie> {
    const trimmedName = name?.trim();
    const trimmedEmoji = emoji?.trim();
    if (!trimmedName)
      throw new BadRequestException('Name darf nicht leer sein');
    if (!trimmedEmoji)
      throw new BadRequestException('Emoji darf nicht leer sein');
    return this.prisma.kategorie.update({
      where: { id },
      data: { name: trimmedName, emoji: trimmedEmoji },
    });
  }

  async delete(id: number) {
    return this.prisma.kategorie.delete({ where: { id } });
  }
}
