import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { BanService } from '../admin/ban.service';
import type { JwtPayload } from './interfaces/jwt-payload.interface';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly banService: BanService,
  ) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Throttle({ short: { limit: 5, ttl: 60000 } })
  @Post('login')
  async login(@Body() body: LoginDto) {
    const { email, password } = body;
    return this.authService.login(email, password);
  }

  @Post('refresh')
  async refresh(@Body('refresh_token') refreshToken: string) {
    return this.authService.refreshAccessToken(refreshToken);
  }

  @Post('logout')
  async logout(@Body('refresh_token') refreshToken: string) {
    return this.authService.logout(refreshToken);
  }

  @Get('check-username/:username')
  async checkUsername(@Param('username') username: string) {
    const available = await this.authService.checkUsernameAvailable(username);
    return { available };
  }

  @Get('suggest-username')
  async suggestUsername(@Query('base') base: string) {
    return this.authService.suggestUsername(base);
  }

  @Get('me/ban-status')
  @UseGuards(JwtAuthGuard)
  async getBanStatus(@CurrentUser() user: JwtPayload) {
    return this.banService.getBanStatus(user.sub);
  }
}
