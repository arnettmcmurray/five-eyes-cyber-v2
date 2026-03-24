import { Router } from 'express';
import { sendEmail } from '../../lib/email.js';

const router = Router();

const NOTIFY_ADDRESS = 'info@fiveeyesltd.com';

/**
 * POST /public/contact
 * Body: { firstName, lastName, email, phone?, company?, message?, newsletter? }
 *
 * Enterprise contact form submission.
 * Sends a notification email to the Five Eyes team.
 * No auth required — uses API key guard only (applied globally).
 */
router.post('/contact', async (req, res) => {
  const { firstName, lastName, email, phone, company, message, newsletter } = req.body ?? {};

  if (typeof firstName !== 'string' || !firstName.trim()) {
    res.status(400).json({ error: 'firstName is required' });
    return;
  }
  if (typeof lastName !== 'string' || !lastName.trim()) {
    res.status(400).json({ error: 'lastName is required' });
    return;
  }
  if (typeof email !== 'string' || !email.includes('@') || email.length > 320) {
    res.status(400).json({ error: 'Valid email is required' });
    return;
  }

  const safeTrim = (v: unknown): string =>
    typeof v === 'string' ? v.trim().slice(0, 1000) : '';

  const text = [
    `New enterprise contact submission`,
    ``,
    `Name:      ${safeTrim(firstName)} ${safeTrim(lastName)}`,
    `Email:     ${safeTrim(email)}`,
    `Phone:     ${safeTrim(phone) || '—'}`,
    `Company:   ${safeTrim(company) || '—'}`,
    `Newsletter: ${newsletter ? 'Yes' : 'No'}`,
    ``,
    `Message:`,
    safeTrim(message) || '(none)',
  ].join('\n');

  try {
    await sendEmail({
      to: NOTIFY_ADDRESS,
      subject: `Contact form: ${safeTrim(firstName)} ${safeTrim(lastName)} — ${safeTrim(company) || safeTrim(email)}`,
      text,
    });

    console.log(`[contact] submission from=${safeTrim(email)} company=${safeTrim(company)}`);
    res.status(204).send();
  } catch (err) {
    console.error('[contact] error:', err instanceof Error ? err.message : String(err));
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
