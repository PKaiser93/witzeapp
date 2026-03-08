import { Module } from '@nestjs/common';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { BadgeModule } from '../badges/badges.modul';

@Module({
  imports: [PrismaModule, NotificationsModule, BadgeModule],
  controllers: [FollowController],
  providers: [FollowService],
})
export class FollowModule {}
