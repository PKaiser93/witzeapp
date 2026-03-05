import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { WitzeModule } from './witze/witze.module';
import { AuthModule } from './auth/auth.module';
import { KategorieModule } from './kategorie/kategorie.module';
import { ProfileModule } from './profile/profile.module';

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
  ],
})
export class AppModule {}
