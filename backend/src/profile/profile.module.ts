import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { WitzeModule } from '../witze/witze.module';
import { BadgeModule } from '../badges/badges.modul';

@Module({
  imports: [PrismaModule, AuthModule, WitzeModule, BadgeModule],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
