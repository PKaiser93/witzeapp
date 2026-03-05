import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'witze-super-secret',
    });
  }

  async validate(payload: any) {
    // ✅ payload = { sub: userId, email, username } von JWT.sign()
    return {
      id: payload.sub,  // User ID als Zahl!
      username: payload.username,
      email: payload.email
    };
  }
}

