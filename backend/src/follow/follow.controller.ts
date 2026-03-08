import {
  Controller,
  Post,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { FollowService } from './follow.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('follow')
@UseGuards(JwtAuthGuard)
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post(':id')
  toggleFollow(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.followService.toggleFollow(user.sub, id);
  }

  @Get(':id/status')
  isFollowing(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.followService.isFollowing(user.sub, id);
  }

  @Get(':id/counts')
  getFollowCounts(@Param('id', ParseIntPipe) id: number) {
    return this.followService.getFollowCounts(id);
  }

  @Get('feed/following')
  getFollowingFeed(@CurrentUser() user: JwtPayload) {
    return this.followService.getFollowingFeed(user.sub);
  }
}
