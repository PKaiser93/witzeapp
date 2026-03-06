import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { WitzeService } from './witze.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

interface CreateWitzDto {
  text: string;
  kategorieId?: number | null;
}

@Controller('witze')
export class WitzeController {
  constructor(private readonly witzeService: WitzeService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('kategorie') kategorie?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
  ) {
    return this.witzeService.findAll(user.sub, kategorie, search, sort);
  }

  @Get('public')
  findAllPublic() {
    return this.witzeService.findAll();
  }

  @Get('random')
  findRandom() {
    return this.witzeService.findRandom();
  }

  @Get('kategorien')
  getKategorien() {
    return this.witzeService.findAllKategorien();
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  findMine(@CurrentUser() user: JwtPayload) {
    return this.witzeService.findByUser(user.sub);
  }

  @Get('leaderboard')
  @UseGuards(JwtAuthGuard)
  getLeaderboard() {
    return this.witzeService.getLeaderboard();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.witzeService.findOne(id, user.sub);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() body: CreateWitzDto, @CurrentUser() user: JwtPayload) {
    return this.witzeService.create(
      body.text,
      user.sub,
      body.kategorieId ?? null,
    );
  }

  @Patch(':id/like')
  @UseGuards(JwtAuthGuard)
  like(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload) {
    return this.witzeService.like(id, user.sub);
  }
}
