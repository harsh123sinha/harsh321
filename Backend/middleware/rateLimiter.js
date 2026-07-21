import rateLimit from 'express-rate-limit';

/** Prefer Cloudflare client IP, then Express req.ip (needs trust proxy). */
function clientIpKey(req) {
  const cf = String(req.headers['cf-connecting-ip'] || '').split(',')[0].trim();
  if (cf) return cf;
  const real = String(req.headers['x-real-ip'] || '').split(',')[0].trim();
  if (real) return real;
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

// Rate limiter for auth routes (login, signup, forgot password)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 40,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: clientIpKey,
  // Custom keyGenerator: skip IPv6 validation warning from express-rate-limit v7+
  validate: { xForwardedForHeader: false, ip: false },
});

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  message: { error: 'Too many requests from this IP, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: clientIpKey,
  validate: { xForwardedForHeader: false, ip: false },
});
