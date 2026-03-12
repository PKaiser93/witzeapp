// src/admin/dto/ban-user.dto.ts
import { IsIn, IsString, MaxLength } from 'class-validator';

export class BanUserDto {
  @IsString()
  @MaxLength(500)
  reason!: string;

  @IsString()
  @IsIn(['1h', '4h', '12h', '1d', '7d', '14d', '30d', '1y', 'permanent'])
  duration!: string;
}
