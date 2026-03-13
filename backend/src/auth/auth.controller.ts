import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Headers,
  Res,
  Req,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { BanService } from '../admin/ban.service';
import type { JwtPayload } from './interfaces/jwt-payload.interface';
import { Throttle } from '@nestjs/throttler';
import { SkipEmailVerification } from '../common/decorators/skip-email-verification.decorator';

// Hilfsfunktion – Cookie-Optionen an einem Ort pflegen
function refreshCookieOptions(): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax';
  path: string;
  maxAge: number;
} {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

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
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: any) {
    const result = await this.authService.login(body.email, body.password);

    const r = res as any; // ← TS hier ruhigstellen
    r.cookie('refresh_token', result.refresh_token, refreshCookieOptions());

    return {
      access_token: result.access_token,
      user: result.user,
    };
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: any) {
    const token = (req as any).cookies?.['refresh_token'];
    const r = res as any;

    if (!token) {
      return r.status(401).json({ message: 'Kein Refresh Token vorhanden' });
    }

    const result = await this.authService.refresh(token);
    r.cookie('refresh_token', result.refresh_token, refreshCookieOptions());

    return {
      access_token: result.access_token,
      user: result.user,
    };
  }

  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: any,
    @Headers('authorization') authHeader: string,
  ) {
    const refreshToken = (req as any).cookies?.['refresh_token'];
    const accessToken = authHeader?.replace('Bearer ', '');
    const r = res as any;

    r.clearCookie('refresh_token', { path: '/auth' });

    return this.authService.logout(refreshToken ?? '', accessToken);
  }

  @Get('verify-email')
  async verifyEmail(
    @Query('token') token: string,
    @Res({ passthrough: true }) res: any,
  ) {
    const result = await this.authService.verifyEmail(token);
    const r = res as any;

    r.cookie('refresh_token', result.refresh_token, refreshCookieOptions());

    return {
      access_token: result.access_token,
      user: result.user,
    };
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

  @Throttle({ short: { limit: 3, ttl: 60000 } })
  @Post('resend-verification')
  @UseGuards(JwtAuthGuard)
  @SkipEmailVerification()
  async resendVerification(@CurrentUser() user: JwtPayload) {
    return this.authService.resendVerificationMail(user.sub);
  }

  @Throttle({ short: { limit: 3, ttl: 60000 } })
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('password') password: string,
  ) {
    return this.authService.resetPassword(token, password);
  }
}
