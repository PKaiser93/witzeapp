import { Controller, Get, Delete, Patch, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ProfileService, ProfileResponse } from './profile.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Req } from '@nestjs/common';
import { Request } from 'express';

interface UpdateWitzDto {
    text: string;
}

@Controller('profile')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) {}

    @Get()
    @UseGuards(JwtAuthGuard)
    async getProfile(@Req() req: Request & { user: JwtPayload }): Promise<ProfileResponse> {
        return this.profileService.getProfile(req.user.sub);
    }

    @Delete('witz/:id')
    @UseGuards(JwtAuthGuard)
    async deleteWitz(
        @Param('id', ParseIntPipe) id: number,
        @Req() req: Request & { user: JwtPayload },
    ) {
        return this.profileService.deleteWitz(id, req.user.sub);
    }

    @Patch('witz/:id')
    @UseGuards(JwtAuthGuard)
    async updateWitz(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateData: UpdateWitzDto,
        @Req() req: Request & { user: JwtPayload },
    ) {
        return this.profileService.updateWitz(id, updateData.text, req.user.sub);
    }
}
