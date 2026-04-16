import { rateLimit } from 'express-rate-limit';

// Shared handler to avoid leaking rate-limit internals
const rateLimitHandler = (_req: any, res: any) => {
  res.status(429).json({ error: 'Too many requests. Please try again later.' });
};

/** OTP request/verify + admin login — tight limit to prevent brute-force and OTP spam */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: rateLimitHandler,
});

/** Assessment funnel — unauthenticated, public-facing */
export const assessmentRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: rateLimitHandler,
});

/** KB ingest — admin only but computationally expensive (chunking + embedding) */
export const ingestRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: rateLimitHandler,
});

/** TTX participant routes — relatively permissive, active session traffic */
export const participateRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 60,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: rateLimitHandler,
});

/** TTX AI assist — expensive OpenAI API calls, admin only */
export const assistRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: rateLimitHandler,
});
