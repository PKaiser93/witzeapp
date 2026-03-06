import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { KategorieService } from './kategorie.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

interface CreateKategorieDto {
  name: string;
  emoji: string;
}

@Controller('kategorien')
export class KategorieController {
  constructor(private readonly kategorieService: KategorieService) {}

  @Get()
  async findAll() {
    return this.kategorieService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async create(@Body() body: CreateKategorieDto) {
    return this.kategorieService.create(body.name, body.emoji);
  }
}
