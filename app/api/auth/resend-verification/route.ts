import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { generateSecureToken } from "@/lib/token";
import { isRateLimited } from "@/lib/rate-limit";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (isRateLimited(ip, "resend-verification", 3, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const email = body.email;

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // Always return success to prevent email enumeration
  const successResponse = NextResponse.json({
    success: true,
    message: "If an account exists with this email, a verification link has been sent.",
  });

  const result = await sql`
    SELECT id, email_verified FROM users WHERE email = ${email}
  `;

  if (result.rows.length === 0 || result.rows[0].email_verified) {
    return successResponse;
  }

  const userId = result.rows[0].id;

  // Delete old verification tokens for this user
  await sql`
    DELETE FROM verification_tokens
    WHERE user_id = ${userId} AND type = 'email_verification'
  `;

  // Generate new token
  const token = generateSecureToken();
  await sql`
    INSERT INTO verification_tokens (user_id, token, type, expires_at)
    VALUES (${userId}, ${token}, 'email_verification', NOW() + INTERVAL '24 hours')
  `;

  await sendVerificationEmail(email, token);

  return successResponse;
}
