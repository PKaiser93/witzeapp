import { Module } from '@nestjs/common';
import { WitzeController } from './witze.controller';
import { WitzeService } from './witze.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [WitzeController],
  providers: [WitzeService],
  exports: [WitzeService],
})
export class WitzeModule {}
