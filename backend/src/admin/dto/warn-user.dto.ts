import { IsString, MaxLength } from 'class-validator';

export class WarnUserDto {
  @IsString()
  @MaxLength(500)
  reason!: string;
}
