import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { WitzeModule } from './witze/witze.module';
import { AuthModule } from './auth/auth.module';
import { KategorieModule } from './kategorie/kategorie.module';
import { ProfileModule } from './profile/profile.module';
import { CommentsModule } from './comments/comments.modul';
import { AdminModule } from './admin/admin.module';
import { AppConfigModule } from './config/config.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    KategorieModule,
    WitzeModule,
    ProfileModule,
    CommentsModule,
    AdminModule,
    AppConfigModule,
  ],
})
export class AppModule {}
