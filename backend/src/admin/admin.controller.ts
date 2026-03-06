import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

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
  ) {
    return this.adminService.updateUserRole(id, role);
  }

  @Delete('users/:id')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteUser(id);
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
  resolveReport(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.resolveReport(id);
  }

  @Delete('reports/:witzId/witz')
  deleteReportedWitz(@Param('witzId', ParseIntPipe) witzId: number) {
    return this.adminService.deleteReportedWitz(witzId);
  }
}
