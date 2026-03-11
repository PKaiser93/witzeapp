import {
  Controller,
  Get,
  Post,
  Patch,
  Query,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { WitzeService } from './witze.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
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
  @UseGuards(OptionalJwtAuthGuard)
  findAll(
    @CurrentUser() user: JwtPayload | null,
    @Query('kategorie') kategorie?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.witzeService.findAll(
      user?.sub,
      kategorie,
      search,
      sort,
      cursor ? parseInt(cursor) : undefined,
      limit ? parseInt(limit) : 20,
    );
  }

  @Get('public')
  findAllPublic(
    @Query('kategorie') kategorie?: string,
    @Query('search') search?: string,
    @Query('sort') sort?: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.witzeService.findAll(
      undefined,
      kategorie,
      search,
      sort,
      cursor ? parseInt(cursor) : undefined,
      limit ? parseInt(limit) : 20,
    );
  }

  @SkipThrottle({ short: true, medium: true })
  @Get('random')
  findRandom() {
    return this.witzeService.findRandom();
  }

  @SkipThrottle({ short: true, medium: true })
  @Get('kategorien')
  getKategorien() {
    return this.witzeService.findAllKategorien();
  }

  @Get('leaderboard')
  getLeaderboard() {
    return this.witzeService.getLeaderboard();
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  findMine(@CurrentUser() user: JwtPayload) {
    return this.witzeService.findByUser(user.sub);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload | null,
  ) {
    return this.witzeService.findOne(id, user?.sub);
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

  @Post(':id/report')
  @UseGuards(JwtAuthGuard)
  report(
    @Param('id', ParseIntPipe) id: number,
    @Body('reason') reason: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.witzeService.report(id, user.sub, reason);
  }
}
