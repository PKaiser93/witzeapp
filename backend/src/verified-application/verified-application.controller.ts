import {
  Controller,
  Post,
  Get,
  Delete,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { VerifiedApplicationService } from './verified-application.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('verified-application')
@UseGuards(JwtAuthGuard)
export class VerifiedApplicationController {
  constructor(private readonly service: VerifiedApplicationService) {}

  // POST /verified-application – Bewerbung einreichen
  @Post()
  apply(@Request() req, @Body('message') message?: string) {
    return this.service.apply(req.user.sub, message);
  }

  // GET /verified-application/me – Eigene Bewerbung
  @Get('me')
  getMyApplication(@Request() req) {
    return this.service.getMyApplication(req.user.sub);
  }

  // DELETE /verified-application/me – Bewerbung zurückziehen
  @Delete('me')
  withdraw(@Request() req) {
    return this.service.withdraw(req.user.sub);
  }

  // Admin-Endpunkte
  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MODERATOR')
  getAllApplications(@Query('status') status?: string) {
    return this.service.getAllApplications(status);
  }

  @Patch('admin/:id/approve')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  approve(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.service.approve(id, req.user.sub);
  }

  @Patch('admin/:id/reject')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MODERATOR')
  reject(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body('adminNote') adminNote?: string,
  ) {
    return this.service.reject(id, req.user.sub, adminNote);
  }
}
