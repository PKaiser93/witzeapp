import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService, // ← hinzufügen
  ) { }

  // ... checkUsernameAvailable & suggestUsername ...

  async register(data: { email: string; password: string; username: string }) {
    const hashed = await bcrypt.hash(data.password, 12);
    const newUser = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashed,
        username: data.username,
      },
    });
    return { id: newUser.id, email: newUser.email, username: newUser.username };
  }

  async login(email: string, password: string) {
    // 🔥 DEBUG: Prüfen was ankommt
    console.log('Login called with:', { email, password });

    if (!email || !password) {
      throw new UnauthorizedException('Email und Passwort erforderlich');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },  // Case-insensitive
    });

    if (!user || !await bcrypt.compare(password, user.password)) {
      throw new UnauthorizedException('Ungültige Anmeldedaten');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email
    };

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '24h'
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    };
  }


  async checkUsernameAvailable(username: string) {
    const existing = await this.prisma.user.findUnique({
      where: { username },
    });
    return !existing;
  }

  async suggestUsername(base: string) {
    let suggestion = base.replace(/[^a-zA-Z0-9]/g, '');
    let counter = 1;
    while (
      await this.prisma.user.findUnique({ where: { username: suggestion } })
    ) {
      suggestion = `${base.replace(/[^a-zA-Z0-9]/g, '')}${counter}`;
      counter++;
    }
    return suggestion;
  }
}
