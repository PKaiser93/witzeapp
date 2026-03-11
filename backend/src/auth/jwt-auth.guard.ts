import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { SKIP_EMAIL_VERIFICATION } from '../common/decorators/skip-email-verification.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Erst JWT validieren (Blacklist, Ban, etc.)
    await super.canActivate(context);

    const skip = this.reflector.getAllAndOverride<boolean>(
      SKIP_EMAIL_VERIFICATION,
      [context.getHandler(), context.getClass()],
    );

    if (skip) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.isVerified) {
      throw new UnauthorizedException(
        'Bitte bestätige zuerst deine E-Mail-Adresse',
      );
    }

    return true;
  }
}
