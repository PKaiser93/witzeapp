import { Controller, Get, Post, Body } from '@nestjs/common';
import { KategorieService } from './kategorie.service';

@Controller('kategorien')
export class KategorieController {
  constructor(private readonly kategorieService: KategorieService) {}

  @Get()
  async findAll() {
    return this.kategorieService.findAll();
  }

  @Post()
  async create(@Body('name') name: string, @Body('emoji') emoji: string) {
    return this.kategorieService.create(name, emoji);
  }
}
