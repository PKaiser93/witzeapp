// register.dto.ts
import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Bitte eine gültige E-Mail-Adresse angeben' })
  email!: string;

  @IsString({ message: 'Passwort muss ein String sein' })
  @MinLength(6, {
    message: 'Passwort muss mindestens 6 Zeichen lang sein',
  })
  password!: string;

  @IsString({ message: 'Username muss ein String sein' })
  @IsNotEmpty({ message: 'Username darf nicht leer sein' })
  username!: string;
}
