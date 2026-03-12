import { IsIn, IsString } from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateRoleDto {
  @IsString()
  @IsIn(['USER', 'ADMIN', 'BETA', 'MODERATOR'])
  role!: Role;
}
