import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Request,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { WitzeService } from './witze.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('witze')
@UseGuards(JwtAuthGuard)
export class WitzeController {
  constructor(private readonly witzeService: WitzeService) { }

  @Get()
  async findAll(@Request() req) {
    return this.witzeService.findAll(req.user?.id);  // ← userId übergeben!
  }

  @Get('random')
  async findRandom() {
    return this.witzeService.findRandom();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body('text') text: string,
    @Body('kategorieId') kategorieId: number,
    @Request() req,
  ) {
    return this.witzeService.create(text, req.user.id, kategorieId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  findMine(@Request() req) {
    return this.witzeService.findByUser(req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.witzeService.findOne(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.witzeService.remove(id, req.user.id);
  }

  // 🔥 LIKE ENDPOINT 🔥
  @Patch(':id/like')
  async like(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.witzeService.like(id, req.user.id);
  }

  @Get('profile')
  async getProfileWitze(@Req() req: Request) {
    const userId = req.user.sub;  // JWT user ID
    return this.witzeService.findUserWitze(userId);
  }


  @Get('kategorien')
  async getKategorien() {
    return this.witzeService.findAllKategorien();
  }

}
