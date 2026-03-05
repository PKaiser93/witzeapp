import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

interface RegisterData {
  email: string;
  password: string;
  username: string;
}

export interface AuthUser {
  id: number;
  email: string;
  username: string;
}

export interface LoginResult {
  access_token: string;
  user: AuthUser;
}

@Injectable()
export class AuthService {
  constructor(
      private readonly prisma: PrismaService,
      private readonly jwtService: JwtService,
  ) {}

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
      },
    });

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

    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '24h',
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };
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
