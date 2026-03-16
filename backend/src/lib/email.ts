/**
 * Email delivery via AWS SES.
 *
 * Behaviour:
 *   - If SES_FROM_ADDRESS env var is set: send via SES (production).
 *   - Otherwise: print to stdout (development / local fallback).
 *
 * AWS credentials are resolved by the SDK's default chain:
 *   ECS task role → instance profile → ~/.aws/credentials → env vars.
 * No explicit credential config is needed when running on ECS Fargate.
 *
 * Required env vars (production):
 *   SES_FROM_ADDRESS  — verified SES sender address (e.g. noreply@fiveeyesltd.com)
 *   AWS_REGION        — region where SES is configured (e.g. us-east-1)
 */

import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

let sesClient: SESClient | null = null;

function getClient(): SESClient {
  if (!sesClient) {
    sesClient = new SESClient({ region: process.env['AWS_REGION'] ?? 'us-east-1' });
  }
  return sesClient;
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
  const from = process.env['SES_FROM_ADDRESS'];

  if (!from) {
    // Dev fallback — print to stdout so the code path is exercised locally
    console.log(`[email:dev] to=${msg.to} subject="${msg.subject}"\n${msg.text}`);
    return;
  }

  try {
    await getClient().send(new SendEmailCommand({
      Source: from,
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
    // Log but never surface SES errors to callers — OTP/assessment flows
    // must not fail just because email delivery fails (handle separately).
    console.error('[email:ses] delivery failed:', err instanceof Error ? err.message : String(err));
  }
}
