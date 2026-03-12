import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;
  private from: string;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.from = process.env.MAIL_FROM ?? 'WitzeApp <support@mail.witzeapp.de>';
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

  async sendSupportTicketConfirmation(
    email: string,
    subject: string,
    message: string,
    ticketId: string,
  ) {
    await this.resend.emails.send({
      from: this.from,
      to: email,
      subject: `WitzeApp – Wir haben dein Ticket ${ticketId} erhalten`,
      html: `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                  max-width: 520px; 
                  margin: 0 auto; 
                  padding: 24px; 
                  background-color: #0b0b12;
                  color: #f9fafb;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="font-size: 28px; font-weight: 800; color: #facc15;">WitzeApp</div>
          <div style="font-size: 13px; color: #9ca3af; margin-top: 4px;">
            Danke für deine Nachricht 🙌
          </div>
        </div>

        <div style="background: radial-gradient(circle at top, #1f2937 0, #020617 55%);
                    border-radius: 16px;
                    padding: 20px 20px 16px;
                    border: 1px solid #1f2937;">
          <p style="margin: 0 0 8px; font-size: 15px;">Hey 👋</p>
          <p style="margin: 0 0 12px; font-size: 14px; color: #e5e7eb;">
            wir haben deine Support-Anfrage erhalten und uns direkt ein Ticket notiert.
          </p>

          <div style="margin: 16px 0; padding: 12px 14px; border-radius: 12px; background-color: #030712;">
            <div style="font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: #9ca3af; margin-bottom: 4px;">
              Ticket-ID
            </div>
            <div style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
                        font-size: 13px;
                        color: #facc15;">
              ${ticketId}
            </div>
          </div>

          <div style="margin: 18px 0 10px;">
            <div style="font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: #9ca3af; margin-bottom: 4px;">
              Betreff
            </div>
            <div style="font-size: 14px; color: #f9fafb;">${subject}</div>
          </div>

          <div style="margin: 10px 0 4px;">
            <div style="font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: #9ca3af; margin-bottom: 4px;">
              Deine Nachricht
            </div>
            <div style="font-size: 14px; color: #e5e7eb; white-space: pre-line; line-height: 1.5;">
              ${message}
            </div>
          </div>

          <p style="margin: 16px 0 0; font-size: 13px; color: #9ca3af;">
            Du kannst diese E-Mail einfach aufbewahren – mit der Ticket-ID können wir dein Anliegen schneller zuordnen.
          </p>
        </div>

        <div style="margin-top: 18px; font-size: 12px; color: #6b7280; text-align: center;">
          Viele Grüße<br/>
          dein WitzeApp-Team 🧡
        </div>
      </div>
    `,
    });
  }
}
