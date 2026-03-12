import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { SupportService } from './support.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  // Kontaktformular: darf jeder (oder nur eingeloggte User, je nach Wunsch)
  @Post('contact')
  async contact(
    @Body('subject') subject: string,
    @Body('message') message: string,
    @Body('email') email?: string,
  ) {
    if (!subject || !message) {
      return {
        success: false,
        message: 'Betreff und Nachricht sind erforderlich.',
      };
    }

    await this.supportService.createMessage(subject, message, email);
    return { success: true };
  }

  // Admin-Detailansicht: NUR ADMIN
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.supportService.findOne(Number(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  async findAll(
    @Query('status') status?: 'OPEN' | 'IN_PROGRESS' | 'CLOSED',
    @Query('skip') skip = '0',
    @Query('take') take = '50',
  ) {
    return this.supportService.findAll({
      status,
      skip: Number(skip),
      take: Number(take),
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('ticket/:ticketId')
  async findByTicket(@Param('ticketId') ticketId: string) {
    return this.supportService.findByTicketId(ticketId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED',
  ) {
    return this.supportService.updateStatus(Number(id), status);
  }
}
