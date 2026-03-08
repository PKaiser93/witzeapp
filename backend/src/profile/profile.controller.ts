import {
  Controller,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { ProfileService, ProfileResponse } from './profile.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { Response } from 'express';

interface UpdateWitzDto {
  text: string;
}

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: JwtPayload): Promise<ProfileResponse> {
    return this.profileService.getProfile(user.sub);
  }

  @Delete('witz/:id')
  @UseGuards(JwtAuthGuard)
  async deleteWitz(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.profileService.deleteWitz(id, user.sub);
  }

  @Patch('witz/:id')
  @UseGuards(JwtAuthGuard)
  async updateWitz(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: UpdateWitzDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.profileService.updateWitz(id, updateData.text, user.sub);
  }

  @Get('warnings')
  @UseGuards(JwtAuthGuard)
  async getWarnings(@CurrentUser() user: JwtPayload) {
    return this.profileService.getWarnings(user.sub);
  }

  @Patch('password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Body() body: { oldPassword: string; newPassword: string },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.profileService.changePassword(
      user.sub,
      body.oldPassword,
      body.newPassword,
    );
  }

  @Delete('account')
  @UseGuards(JwtAuthGuard)
  async deleteAccount(@CurrentUser() user: JwtPayload) {
    return this.profileService.deleteAccount(user.sub);
  }

  @Patch('username')
  @UseGuards(JwtAuthGuard)
  async changeUsername(
    @Body('username') username: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.profileService.changeUsername(user.sub, username);
  }

  @Get('user/:username/badges')
  async getPublicBadges(@Param('username') username: string) {
    const user = await this.profileService.getUserByUsername(username);
    return this.profileService.getBadges(user.id);
  }

  @Get('user/:username')
  async getPublicProfile(@Param('username') username: string) {
    return this.profileService.getPublicProfile(username);
  }

  @Patch('bio')
  @UseGuards(JwtAuthGuard)
  async updateBio(@Body('bio') bio: string, @CurrentUser() user: JwtPayload) {
    return this.profileService.updateBio(user.sub, bio ?? '');
  }

  @Get('badges')
  @UseGuards(JwtAuthGuard)
  async getBadges(@CurrentUser() user: JwtPayload) {
    return this.profileService.getBadges(user.sub);
  }

  @Get('export')
  @UseGuards(JwtAuthGuard)
  async exportData(@CurrentUser() user: JwtPayload, @Res() res: Response) {
    const data = await this.profileService.exportData(user.sub);
    const json = JSON.stringify(data, null, 2);
    (res as any).setHeader('Content-Type', 'application/json');
    (res as any).setHeader(
      'Content-Disposition',
      `attachment; filename="witzeapp-export-${user.sub}.json"`,
    );
    (res as any).send(json);
  }
}
