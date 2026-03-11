import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes, randomUUID } from 'crypto';
import { MailService } from '../mail/mail.service';

interface RegisterData {
  email: string;
  password: string;
  username: string;
}

export interface AuthUser {
  id: number;
  email: string;
  username: string;
  role: string;
}

export interface LoginResult {
  access_token: string;
  user: AuthUser;
  refresh_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async verifyEmail(token: string): Promise<LoginResult> {
    const record = await this.prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!record) {
      throw new UnauthorizedException('Ungültiger Verifizierungs-Token');
    }

    if (record.expiresAt < new Date()) {
      await this.prisma.verificationToken.delete({ where: { token } });
      throw new UnauthorizedException('Token abgelaufen – bitte neu anfordern');
    }

    // User als verifiziert markieren
    const user = await this.prisma.user.update({
      where: { id: record.userId },
      data: { isVerified: true },
      select: { id: true, email: true, username: true, role: true },
    });

    await this.prisma.verificationToken.delete({ where: { token } });

    // Neue Tokens ausstellen
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    const refreshToken = randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    await this.prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user,
    };
  }

  async resendVerificationMail(userId: number): Promise<{ success: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, username: true, isVerified: true },
    });

    if (!user) throw new UnauthorizedException('User nicht gefunden');
    if (user.isVerified) {
      throw new UnauthorizedException('E-Mail bereits verifiziert');
    }

    // Alte Token löschen
    await this.prisma.verificationToken.deleteMany({
      where: { userId: user.id },
    });

    // Neuen Token erstellen
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.prisma.verificationToken.create({
      data: { token, userId: user.id, expiresAt },
    });

    await this.mailService.sendVerificationMail(
      user.email,
      user.username,
      token,
    );

    return { success: true };
  }

  async register(data: RegisterData): Promise<AuthUser> {
    const email = data.email.trim().toLowerCase();
    const password = data.password;
    const username = data.username.trim();

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
      },
    });

    // Verifizierungs-Token generieren
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Stunden

    await this.prisma.verificationToken.create({
      data: {
        token,
        userId: newUser.id,
        expiresAt,
      },
    });

    // Verifizierungs-E-Mail senden
    await this.mailService.sendVerificationMail(email, username, token);

    return newUser;
  }

  async login(email: string, password: string): Promise<LoginResult> {
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      throw new UnauthorizedException('Email und Passwort erforderlich');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new UnauthorizedException('Ungültige Anmeldedaten');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Ungültige Anmeldedaten');
    }

    const ban = await this.prisma.ban.findUnique({
      where: { userId: user.id },
    });
    if (ban?.active) {
      if (!ban.expiresAt || ban.expiresAt > new Date()) {
        const until = ban.expiresAt
          ? `bis ${ban.expiresAt.toLocaleDateString('de-DE')}`
          : 'permanent';
        throw new UnauthorizedException(
          `Dein Account ist gesperrt (${until}). Grund: ${ban.reason}`,
        );
      } else {
        // Ban abgelaufen → deaktivieren
        await this.prisma.ban.update({
          where: { userId: user.id },
          data: { active: false },
        });
      }
    }

    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    };

    // Access Token – kurzlebig
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    // Refresh Token – zufälliger String, 7 Tage gültig
    const refreshToken = randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Alte Refresh Tokens des Users löschen
    await this.prisma.refreshToken.deleteMany({ where: { userId: user.id } });

    // Neuen Refresh Token speichern
    await this.prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role, // ← ergänzen
      },
    };
  }

  async refreshAccessToken(refreshToken: string) {
    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: {
        user: { select: { id: true, username: true, email: true, role: true } },
      },
    });

    if (!stored) throw new UnauthorizedException('Ungültiger Refresh Token');
    if (stored.expiresAt < new Date()) {
      await this.prisma.refreshToken.delete({ where: { token: refreshToken } });
      throw new UnauthorizedException('Refresh Token abgelaufen');
    }

    const payload = {
      sub: stored.user.id,
      username: stored.user.username,
      email: stored.user.email,
      role: stored.user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    return { access_token: accessToken };
  }

  async logout(refreshToken: string, accessToken?: string) {
    // Refresh Token löschen
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });

    // Access Token blacklisten falls vorhanden
    if (accessToken) {
      try {
        const decoded = this.jwtService.decode(accessToken) as { exp?: number };
        if (decoded?.exp) {
          const expiresAt = new Date(decoded.exp * 1000);
          await this.prisma.blacklistedToken.create({
            data: { token: accessToken, expiresAt },
          });
        }
      } catch {}
    }

    return { success: true };
  }

  async checkUsernameAvailable(username: string): Promise<boolean> {
    const normalizedUsername = username.trim();

    if (!normalizedUsername) {
      return false;
    }

    const existing = await this.prisma.user.findUnique({
      where: { username: normalizedUsername },
      select: { id: true },
    });

    return !existing;
  }

  async suggestUsername(base: string): Promise<string> {
    const cleanedBase = base.replace(/[^a-zA-Z0-9]/g, '').trim() || 'user';
    let suggestion = cleanedBase;
    let counter = 1;

    const maxAttempts = 1000;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const existing = await this.prisma.user.findUnique({
        where: { username: suggestion },
        select: { id: true },
      });

      if (!existing) {
        return suggestion;
      }

      suggestion = `${cleanedBase}${counter}`;
      counter++;

      if (counter > maxAttempts) {
        throw new Error('Konnte keinen freien Username finden');
      }
    }
  }
}
