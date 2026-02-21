import sgMail from "@sendgrid/mail";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@example.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export async function sendVerificationEmail(
  to: string,
  token: string
): Promise<void> {
  const verifyUrl = `${APP_URL}/api/auth/verify?token=${token}`;

  if (!SENDGRID_API_KEY) {
    console.log(`[DEV] Verification email for ${to}: ${verifyUrl}`);
    return;
  }

  await sgMail.send({
    to,
    from: FROM_EMAIL,
    subject: "Verify your email - Kakeibo",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #333;">Welcome to Kakeibo!</h2>
        <p>Please verify your email address by clicking the button below:</p>
        <a href="${verifyUrl}"
           style="display: inline-block; background: #4a6cf7; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
          Verify Email
        </a>
        <p style="color: #666; font-size: 14px;">This link expires in 24 hours.</p>
        <p style="color: #999; font-size: 12px;">If you didn't create an account, you can ignore this email.</p>
      </div>
    `,
  });
}

export async function sendEmailChangeVerification(
  to: string,
  token: string
): Promise<void> {
  const verifyUrl = `${APP_URL}/api/auth/verify?token=${token}`;

  if (!SENDGRID_API_KEY) {
    console.log(`[DEV] Email change verification for ${to}: ${verifyUrl}`);
    return;
  }

  await sgMail.send({
    to,
    from: FROM_EMAIL,
    subject: "Confirm email change - Kakeibo",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #333;">Email Change Request</h2>
        <p>Please confirm your new email address by clicking the button below:</p>
        <a href="${verifyUrl}"
           style="display: inline-block; background: #4a6cf7; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
          Confirm Email Change
        </a>
        <p style="color: #666; font-size: 14px;">This link expires in 24 hours.</p>
        <p style="color: #999; font-size: 12px;">If you didn't request this change, you can ignore this email.</p>
      </div>
    `,
  });
}
