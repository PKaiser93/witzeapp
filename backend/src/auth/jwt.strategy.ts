import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'witze-super-secret',  // Login Secret!
        });
    }

    async validate(payload: any) {
        // ✅ JWT Payload → req.user
        return {
            id: payload.sub,  // User ID!
            username: payload.username,
            email: payload.email
        };
    }
}
