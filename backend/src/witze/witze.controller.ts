import {
  Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe,
  UseGuards, Req  // Nur Req!
} from '@nestjs/common';
import { WitzeService } from './witze.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// KEIN JwtUser import nötig!

@Controller('witze')
export class WitzeController {
  constructor(private readonly witzeService: WitzeService) { }

  @Get()
  findAll(@Req() req: any) {  // req.user aus JWT
    return this.witzeService.findAll(req.user?.sub);
  }

  @Get('random')
  findRandom() {
    return this.witzeService.findRandom();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body('text') text: string, @Body('kategorieId') kategorieId: number, @Req() req: any) {
    return this.witzeService.create(text, Number(req.user.sub), kategorieId);  // ✅ Number!
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  findMine(@Req() req: any) {
    return this.witzeService.findByUser(Number(req.user.sub));  // ✅ Number!
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.witzeService.findOne(id, req.user?.sub);
  }

  @Patch(':id/like')
  @UseGuards(JwtAuthGuard)
  like(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.witzeService.like(id, Number(req.user.sub));  // ✅ Number!
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfileWitze(@Req() req: any) {
    return this.witzeService.getProfile(Number(req.user.sub));
  }


  @Get('no-guard-profile')  // Neue Route!
  noGuardProfile(@Req() req: any) {
    return {
      success: true,
      user: req.user,
      sub: req.user?.sub,
      subType: typeof req.user?.sub,
      profileData: {
        username: "Patrick",
        witze: [],
        likesReceived: 0,
        rang: "🥉 Neuling"
      }
    };
  }



  @Get('kategorien')
  getKategorien() {
    return this.witzeService.findAllKategorien();
  }

  @Get('debug')
  async debug(@Req() req: any) {
    return {
      user: req.user,
      subType: typeof req.user?.sub,
      subValue: req.user?.sub,
      userId: Number(req.user?.sub),
      headers: req.headers.authorization
    };
  }
}
