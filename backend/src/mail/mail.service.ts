import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailer: MailerService) {}

  async sendVerificationMail(email: string, username: string, token: string) {
    const url = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;

    await this.mailer.sendMail({
      to: email,
      subject: 'WitzeApp – E-Mail bestätigen',
      html: `
        <h2>Hallo ${username}!</h2>
        <p>Willkommen bei der WitzeApp. Bitte bestätige deine E-Mail-Adresse:</p>
        <a href="${url}" style="
          display: inline-block;
          padding: 12px 24px;
          background-color: #f59e0b;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: bold;
        ">E-Mail bestätigen</a>
        <p>Der Link ist 24 Stunden gültig.</p>
        <p>Falls du dich nicht registriert hast, kannst du diese E-Mail ignorieren.</p>
      `,
    });
  }

  async sendPasswordResetMail(email: string, username: string, token: string) {
    const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await this.mailer.sendMail({
      to: email,
      subject: 'WitzeApp – Passwort zurücksetzen',
      html: `
      <h2>Hallo ${username}!</h2>
      <p>Du hast eine Anfrage gestellt, dein Passwort zurückzusetzen.</p>
      <a href="${url}" style="
        display: inline-block;
        padding: 12px 24px;
        background-color: #4f46e5;
        color: white;
        text-decoration: none;
        border-radius: 6px;
        font-weight: bold;
      ">Passwort zurücksetzen</a>
      <p>Der Link ist <strong>1 Stunde</strong> gültig.</p>
      <p>Falls du kein Passwort-Reset angefordert hast, kannst du diese E-Mail ignorieren.</p>
    `,
    });
  }
}
