import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { WitzeModule } from './witze/witze.module';
import { AuthModule } from './auth/auth.module';
import { KategorieModule } from './kategorie/kategorie.module';
import { ProfileModule } from './profile/profile.module';
import { CommentsModule } from './comments/comments.modul';
import { AdminModule } from './admin/admin.module';
import { AppConfigModule } from './config/config.module';
import { NotificationsModule } from './notifications/notifications.module';
import { FollowModule } from './follow/follow.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    KategorieModule,
    WitzeModule,
    ProfileModule,
    CommentsModule,
    AdminModule,
    AppConfigModule,
    NotificationsModule,
    FollowModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
