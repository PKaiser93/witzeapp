import {
  Controller,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ProfileService, ProfileResponse } from './profile.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CurrentUser } from '../common/decorators/current-user.decorator';

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
}
