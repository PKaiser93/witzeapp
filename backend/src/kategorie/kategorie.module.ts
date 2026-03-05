import { Module } from '@nestjs/common';
import { KategorieController } from './kategorie.controller';
import { KategorieService } from './kategorie.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [KategorieController],
  providers: [KategorieService],
  exports: [KategorieService],
})
export class KategorieModule {}
