import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { WitzeModule } from '../witze/witze.module';  // ← NEU!

@Module({
    imports: [PrismaModule, AuthModule, WitzeModule],  // ← WitzeModule hinzufügen!
    controllers: [ProfileController],
    providers: [ProfileService],
    exports: [ProfileService]  // ← Export für spätere Nutzung
})
export class ProfileModule { }
