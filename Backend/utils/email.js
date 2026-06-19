import nodemailer from 'nodemailer';

/**
 * Nodemailer API is `createTransport` (not createTransporter).
 * Returns null if SMTP env is incomplete so callers can surface a clear error.
 */
const createMailTransport = () => {
  const host = (process.env.SMTP_HOST || '').trim() || 'smtp.gmail.com';
  const user = (process.env.SMTP_USER || '').trim();
  /** Gmail app passwords are 16 chars; strip all whitespace (spaces in .env often cause 535). */
  const pass = String(process.env.SMTP_PASSWORD ?? '')
    .replace(/\s+/g, '')
    .trim();
  if (!user || !pass) {
    return null;
  }

  const isGmailUser = /@gmail\.com$/i.test(user);
  const isGmailHost = /^smtp\.gmail\.com$/i.test(host);

  // Uses port 465 + SSL internally — helps when corporate networks block 587 (STARTTLS).
  if (isGmailUser && isGmailHost) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }

  const port = Number.parseInt(String(process.env.SMTP_PORT || '587'), 10) || 587;
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: port === 587,
    auth: { user, pass },
  });
};

// Send OTP email
export const sendOTPEmail = async (email, otp, userName = 'User') => {
  const transporter = createMailTransport();
  if (!transporter) {
    console.error('[email] OTP skipped: set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD in Backend/.env');
    return { success: false, error: 'SMTP_NOT_CONFIGURED' };
  }

  try {

    const fromAddr = (process.env.SMTP_FROM || process.env.SMTP_USER || '').trim();
    const mailOptions = {
      // Gmail SMTP usually requires From to match the authenticated mailbox (or a verified alias).
      from: fromAddr || process.env.SMTP_USER,
      to: email,
      subject: 'Password Reset OTP - Real Estate Portal',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0F172A; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .otp-box { background: #D4AF37; color: #0F172A; font-size: 32px; font-weight: bold; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; letter-spacing: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello ${userName},</p>
              <p>You requested to reset your password. Use the OTP below to complete the process:</p>
              <div class="otp-box">${otp}</div>
              <p><strong>This OTP is valid for 10 minutes.</strong></p>
              <p>If you didn't request this, please ignore this email.</p>
              <p>Best regards,<br>Real Estate Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Real Estate Portal. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    const isUnreachable =
      error?.code === 'ETIMEDOUT' ||
      error?.code === 'ESOCKET' ||
      error?.code === 'ECONNRESET' ||
      /ETIMEDOUT|ECONNREFUSED|ENOTFOUND|getaddrinfo/i.test(String(error?.message || ''));

    const isAuthRejected =
      error?.code === 'EAUTH' ||
      /535|Invalid login|BadCredentials/i.test(String(error?.message || ''));

    if (process.env.NODE_ENV !== 'production' && isAuthRejected) {
      const u = (process.env.SMTP_USER || '').trim();
      const plen = String(process.env.SMTP_PASSWORD ?? '')
        .replace(/\s+/g, '')
        .trim().length;
      console.warn(
        `[email] Gmail rejected login (535). SMTP_USER="${u}"; app-password length=${plen} (must be 16). User must match the Google account that created the App Password.`
      );
    }

    const devFallback =
      process.env.NODE_ENV !== 'production' &&
      process.env.DEV_OTP_TO_CONSOLE === 'true' &&
      (isUnreachable || isAuthRejected);

    if (devFallback) {
      console.warn(
        `\n========== DEV_OTP_TO_CONSOLE (SMTP failed; do not use in production) ==========\n` +
          `  Email: ${email}\n` +
          `  OTP:   ${otp}\n` +
          `  Error: ${error?.message || error?.code}\n` +
          `================================================================================\n`
      );
      return { success: true, devConsoleFallback: true };
    }

    return { success: false, error: error.message };
  }
};
