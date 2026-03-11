import { SetMetadata } from '@nestjs/common';

export const SKIP_EMAIL_VERIFICATION = 'skipEmailVerification';
export const SkipEmailVerification = () =>
  SetMetadata(SKIP_EMAIL_VERIFICATION, true);
