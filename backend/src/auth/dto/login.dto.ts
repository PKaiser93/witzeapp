import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;  // ✅ Definite Assignment!

  @IsString()
  @MinLength(6)
  password!: string;
}
