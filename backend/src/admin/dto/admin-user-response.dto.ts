import { Role } from '@prisma/client';

export class AdminUserResponseDto {
  id!: number;
  username!: string;
  email!: string;
  role!: Role;
  createdAt!: Date;
  updatedAt!: Date;
  jokesCount!: number;
  commentsCount?: number;
  ban?: { active: boolean; expiresAt: Date | null; reason: string } | null;

  constructor(partial: Partial<AdminUserResponseDto>) {
    Object.assign(this, partial);
  }
}
