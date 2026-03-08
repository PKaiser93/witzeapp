import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) throw new Error('JWT_SECRET is not configured');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedException('Ungültiger Token-Payload');
    }

    // User existiert noch?
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true },
    });
    if (!user) throw new UnauthorizedException('User nicht gefunden');

    // Gebannt?
    const ban = await this.prisma.ban.findUnique({
      where: { userId: payload.sub },
    });
    if (ban?.active) {
      if (!ban.expiresAt || ban.expiresAt > new Date()) {
        throw new UnauthorizedException('Dein Account ist gesperrt');
      }
      // Ban abgelaufen → deaktivieren
      await this.prisma.ban.update({
        where: { userId: payload.sub },
        data: { active: false },
      });
    }

    return {
      sub: Number(payload.sub),
      username: payload.username,
      email: payload.email,
      role: payload.role,
      iat: payload.iat,
      exp: payload.exp,
    };
  }
}
