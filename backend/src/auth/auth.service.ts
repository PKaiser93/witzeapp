import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService, // ← hinzufügen
  ) {}

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
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };
    return {
      access_token: this.jwtService.sign(payload),
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
