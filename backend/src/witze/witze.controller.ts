import {
  Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe,
  UseGuards, Req
} from '@nestjs/common';
import { WitzeService } from './witze.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('witze')
export class WitzeController {
  constructor(private readonly witzeService: WitzeService) { }

  // 🔥 ULTRA-MINIMAL DEBUG
  @Get('usercheck')
  @UseGuards(JwtAuthGuard)
  userCheck(@Req() req: any) {
    return {
      success: true,
      userExists: !!req.user,
      user: req.user || 'NULL',
      sub: req.user?.sub,
      type: typeof req.user?.sub,
      id: Number(req.user?.sub || 0)
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)  // ← Optional Guard!
  findAll(@Req() req: any) {
    const userId = req.user?.sub ? Number(req.user.sub) : undefined;
    console.log('🔥 findAll userId:', userId);  // Sollte 2 loggen!
    return this.witzeService.findAll(userId);
  }


  @Get('public')
  findAllPublic() {
    return this.witzeService.findAll();  // Ohne userId
  }

  @Get('random')
  findRandom() {
    return this.witzeService.findRandom();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() body: any, @Req() req: any) {
    console.log('POST body:', body);  // DEBUG
    return this.witzeService.create(body.text, Number(req.user.sub), body.kategorieId || null);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.witzeService.findOne(id, req.user?.sub);
  }

  @Patch(':id/like')
  @UseGuards(JwtAuthGuard)
  like(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.witzeService.like(id, Number(req.user.sub));
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  findMine(@Req() req: any) {
    return this.witzeService.findByUser(Number(req.user.sub));
  }

  @Get('kategorien')
  getKategorien() {
    return this.witzeService.findAllKategorien();
  }

  @Get('debug')
  @UseGuards(JwtAuthGuard)
  async debug(@Req() req: any) {
    return {
      timestamp: new Date().toISOString(),
      user: req.user,
      subType: typeof req.user?.sub,
      subValue: req.user?.sub,
      userId: Number(req.user?.sub || 0),
      headers: req.headers.authorization?.substring(0, 50)
    };
  }

}
