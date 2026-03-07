import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { BanService } from './ban.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly banService: BanService,
  ) {}

  @Get('logs')
  getLogs() {
    return this.adminService.getLogs();
  }

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Patch('users/:id/role')
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('role') role: string,
    @CurrentUser() admin: JwtPayload,
  ) {
    return this.adminService.updateUserRole(id, role, admin.sub);
  }

  @Delete('users/:id')
  deleteUser(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() admin: JwtPayload,
  ) {
    return this.adminService.deleteUser(id, admin.sub);
  }

  @Post('users/:id/ban')
  banUser(
    @Param('id', ParseIntPipe) id: number,
    @Body('reason') reason: string,
    @Body('duration') duration: string,
    @CurrentUser() admin: JwtPayload,
  ) {
    return this.banService.banUser(id, admin.sub, reason, duration);
  }

  @Patch('users/:id/unban')
  unbanUser(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() admin: JwtPayload,
  ) {
    return this.banService.unbanUser(id, admin.sub);
  }

  @Post('users/:id/warn')
  warnUser(
    @Param('id', ParseIntPipe) id: number,
    @Body('reason') reason: string,
    @CurrentUser() admin: JwtPayload,
  ) {
    return this.banService.warnUser(id, admin.sub, reason);
  }

  @Get('users/:id/warnings')
  getWarnings(@Param('id', ParseIntPipe) id: number) {
    return this.banService.getWarnings(id);
  }

  @Delete('users/:userId/warnings/:warningId')
  deleteWarning(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('warningId', ParseIntPipe) warningId: number,
    @CurrentUser() admin: JwtPayload,
  ) {
    return this.banService.deleteWarning(warningId, admin.sub);
  }

  @Get('config')
  getConfig() {
    return this.adminService.getConfig();
  }

  @Patch('config/:key')
  updateConfig(@Param('key') key: string, @Body('value') value: string) {
    return this.adminService.updateConfig(key, value);
  }

  @Get('reports')
  getReports() {
    return this.adminService.getReports();
  }

  @Patch('reports/:id/resolve')
  resolveReport(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() admin: JwtPayload,
  ) {
    return this.adminService.resolveReport(id, admin.sub);
  }

  @Delete('reports/:witzId/witz')
  deleteReportedWitz(
    @Param('witzId', ParseIntPipe) witzId: number,
    @CurrentUser() admin: JwtPayload,
  ) {
    return this.adminService.deleteReportedWitz(witzId, admin.sub);
  }
}
