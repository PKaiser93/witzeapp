import { Expose } from 'class-transformer';

@Expose()
export class BanResponseDto {
  @Expose()
  id!: number;

  @Expose()
  userId!: number;

  @Expose()
  reason!: string;

  @Expose()
  bannedBy!: number;

  @Expose()
  bannedAt!: Date;

  @Expose()
  expiresAt?: Date | null;

  @Expose()
  active!: boolean;

  constructor(partial: Partial<BanResponseDto>) {
    Object.assign(this, partial);
  }
}
