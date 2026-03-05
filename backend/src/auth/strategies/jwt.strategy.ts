import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || '+Z/UpZdWed0PRoTZVyyPKJb/dUQblZSw+VV9Y0WnveM=',
    });
  }

  async validate(payload: any) {
    return {
      sub: Number(payload.sub),
      username: payload.username,
      email: payload.email,
    };
  }
}
