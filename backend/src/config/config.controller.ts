import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('config')
export class ConfigController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getPublicConfig() {
    const configs = await this.prisma.appConfig.findMany();
    return Object.fromEntries(configs.map((c) => [c.key, c.value]));
  }
}
