import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { KategorieService } from './kategorie.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: CreateKategorieDto) {
    return this.kategorieService.create(body.name, body.emoji);
  }
}
