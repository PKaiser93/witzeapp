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
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<JwtPayload> {
    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedException('Ungültiger Token-Payload');
    }

    // Token aus Header extrahieren
    const authHeader = (req as any).headers?.authorization ?? '';
    const token = authHeader.replace('Bearer ', '');

    // Blacklist prüfen
    if (token) {
      const blacklisted = await this.prisma.blacklistedToken.findUnique({
        where: { token },
      });
      if (blacklisted) throw new UnauthorizedException('Token ungültig');
    }

    // User existiert noch? + isVerified laden
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, isVerified: true }, // <--- isVerified ergänzt
    });
    if (!user) throw new UnauthorizedException('User nicht gefunden');

    // Ban prüfen
    const ban = await this.prisma.ban.findUnique({
      where: { userId: payload.sub },
    });
    if (ban?.active) {
      if (!ban.expiresAt || ban.expiresAt > new Date()) {
        throw new UnauthorizedException('Dein Account ist gesperrt');
      }
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
      isVerified: user.isVerified, // <--- NEU
      iat: payload.iat,
      exp: payload.exp,
    };
  }
}
