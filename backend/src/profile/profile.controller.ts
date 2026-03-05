import { Controller, Get, Delete, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ProfileService, ProfileResponse } from './profile.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('profile')
export class ProfileController {
    constructor(private profileService: ProfileService) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    async getProfile(@Req() req: any): Promise<ProfileResponse> {
        return this.profileService.getProfile(Number(req.user.sub));
    }

    @Delete('witz/:id')
    @UseGuards(JwtAuthGuard)
    deleteWitz(@Param('id') id: string, @Req() req: any) {
        return this.profileService.deleteWitz(Number(id), Number(req.user.sub));
    }

    @Patch('witz/:id')
    @UseGuards(JwtAuthGuard)
    updateWitz(@Param('id') id: string, @Body() updateData: { text: string }, @Req() req: any) {
        return this.profileService.updateWitz(Number(id), updateData.text, Number(req.user.sub));
    }
}
