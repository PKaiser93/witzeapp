import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;
  private from: string;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.from = process.env.MAIL_FROM ?? 'WitzeApp <no-reply@witzeapp.de>';
  }

  async sendVerificationMail(email: string, username: string, token: string) {
    const url = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;

    await this.resend.emails.send({
      from: this.from,
      to: email,
      subject: 'WitzeApp – E-Mail bestätigen',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Hallo ${username}! 👋</h2>
          <p>Willkommen bei der WitzeApp. Bitte bestätige deine E-Mail-Adresse:</p>
          <a href="${url}" style="
            display: inline-block;
            padding: 12px 24px;
            background-color: #f59e0b;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 16px 0;
          ">E-Mail bestätigen</a>
          <p style="color: #666; font-size: 14px;">Der Link ist 24 Stunden gültig.</p>
          <p style="color: #666; font-size: 14px;">Falls du dich nicht registriert hast, kannst du diese E-Mail ignorieren.</p>
        </div>
      `,
    });
  }

  async sendPasswordResetMail(email: string, username: string, token: string) {
    const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await this.resend.emails.send({
      from: this.from,
      to: email,
      subject: 'WitzeApp – Passwort zurücksetzen',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Hallo ${username}! 🔑</h2>
          <p>Du hast eine Anfrage gestellt, dein Passwort zurückzusetzen.</p>
          <a href="${url}" style="
            display: inline-block;
            padding: 12px 24px;
            background-color: #4f46e5;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 16px 0;
          ">Passwort zurücksetzen</a>
          <p style="color: #666; font-size: 14px;">Der Link ist <strong>1 Stunde</strong> gültig.</p>
          <p style="color: #666; font-size: 14px;">Falls du kein Passwort-Reset angefordert hast, kannst du diese E-Mail ignorieren.</p>
        </div>
      `,
    });
  }
}
