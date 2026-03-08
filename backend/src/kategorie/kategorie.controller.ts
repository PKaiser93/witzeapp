import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
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

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CreateKategorieDto,
  ) {
    return this.kategorieService.update(id, body.name, body.emoji);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.kategorieService.delete(id);
  }
}
