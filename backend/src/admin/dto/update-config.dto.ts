import { IsString, MaxLength } from 'class-validator';

export class UpdateConfigDto {
  @IsString()
  @MaxLength(1000)
  value!: string;
}
