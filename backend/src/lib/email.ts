/**
 * Email delivery.
 *
 * Priority:
 *   1. SES_FROM_ADDRESS set  → AWS SES (production)
 *   2. SMTP_HOST set         → SMTP relay (dev/staging, e.g. Mailpit on localhost:1025)
 *   3. Neither               → stdout (bare local dev)
 *
 * Mailpit quick-start:
 *   brew install mailpit && mailpit
 *   # Web UI: http://localhost:8025
 *   # SMTP:   localhost:1025 (no auth, no TLS)
 *   Then add to backend/.env:  SMTP_HOST=localhost  SMTP_PORT=1025
 */

import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import nodemailer from 'nodemailer';

let sesClient: SESClient | null = null;
let smtpTransport: nodemailer.Transporter | null = null;

function getSesClient(): SESClient {
  if (!sesClient) {
    sesClient = new SESClient({ region: process.env['AWS_REGION'] ?? 'us-east-1' });
  }
  return sesClient;
}

function getSmtpTransport(): nodemailer.Transporter {
  if (!smtpTransport) {
    smtpTransport = nodemailer.createTransport({
      host: process.env['SMTP_HOST'],
      port: Number(process.env['SMTP_PORT'] ?? 1025),
      secure: false,
      ignoreTLS: true,
    });
  }
  return smtpTransport;
}

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;   // plain-text body
  html?: string;  // optional HTML body
}

/**
 * Send an email. Falls back to stdout if SES_FROM_ADDRESS is not set.
 * Never throws — logs errors server-side and returns silently.
 */
export async function sendEmail(msg: EmailMessage): Promise<void> {
  const sesFrom = process.env['SES_FROM_ADDRESS'];
  const smtpHost = process.env['SMTP_HOST'];

  if (sesFrom) {
    try {
      await getSesClient().send(new SendEmailCommand({
        Source: sesFrom,
        Destination: { ToAddresses: [msg.to] },
        Message: {
          Subject: { Data: msg.subject, Charset: 'UTF-8' },
          Body: {
            Text: { Data: msg.text, Charset: 'UTF-8' },
            ...(msg.html ? { Html: { Data: msg.html, Charset: 'UTF-8' } } : {}),
          },
        },
      }));
    } catch (err) {
      console.error('[email:ses] delivery failed:', err instanceof Error ? err.message : String(err));
    }
    return;
  }

  if (smtpHost) {
    try {
      const from = `Five Eyes <noreply@fiveeyesltd.com>`;
      await getSmtpTransport().sendMail({
        from,
        to: msg.to,
        subject: msg.subject,
        text: msg.text,
        ...(msg.html ? { html: msg.html } : {}),
      });
      console.log(`[email:smtp] sent to=${msg.to} subject="${msg.subject}"`);
    } catch (err) {
      console.error('[email:smtp] delivery failed:', err instanceof Error ? err.message : String(err));
    }
    return;
  }

  // Bare dev fallback — print to stdout
  console.log(`[email:dev] to=${msg.to} subject="${msg.subject}"\n${msg.text}`);
}
