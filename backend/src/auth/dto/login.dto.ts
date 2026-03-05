// login.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Bitte eine gültige E-Mail-Adresse angeben' })
  email!: string;

  @IsString({ message: 'Passwort muss ein String sein' })
  @MinLength(6, {
    message: 'Passwort muss mindestens 6 Zeichen lang sein',
  })
  password!: string;
}
