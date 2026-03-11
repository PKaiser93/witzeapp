import { Module } from '@nestjs/common';
import { VerifiedApplicationService } from './verified-application.service';
import { VerifiedApplicationController } from './verified-application.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [VerifiedApplicationService],
  controllers: [VerifiedApplicationController],
})
export class VerifiedApplicationModule {}
