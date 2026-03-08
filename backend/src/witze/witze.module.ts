import { Module } from '@nestjs/common';
import { WitzeController } from './witze.controller';
import { WitzeService } from './witze.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { BadgeModule } from '../badges/badges.modul';

@Module({
  imports: [PrismaModule, AuthModule, NotificationsModule, BadgeModule],
  controllers: [WitzeController],
  providers: [WitzeService],
  exports: [WitzeService],
})
export class WitzeModule {}
