import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('witze/:witzId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  findAll(@Param('witzId', ParseIntPipe) witzId: number) {
    return this.commentsService.findByWitz(witzId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Param('witzId', ParseIntPipe) witzId: number,
    @Body('text') text: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.commentsService.create(text, user.sub, witzId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.commentsService.remove(id, user.sub);
  }
}
