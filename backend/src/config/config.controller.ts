// src/config/config.controller.ts
import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('config')
export class ConfigController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getPublicConfig() {
    const configs = await this.prisma.appConfig.findMany();
    return Object.fromEntries(configs.map((c) => [c.key, c.value]));
  }
}
