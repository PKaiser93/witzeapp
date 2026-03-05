import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    const { email, password } = body;
    return this.authService.login(email, password);
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
}
