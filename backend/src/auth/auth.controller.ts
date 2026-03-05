import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body() body: { email: string; password: string; username: string },
  ) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Get('check-username/:username')
  async checkUsername(@Param('username') username: string) {
    return {
      available: await this.authService.checkUsernameAvailable(username),
    };
  }

  @Get('suggest-username')
  async suggestUsername(@Query('base') base: string) {
    return await this.authService.suggestUsername(base);
  }
}
