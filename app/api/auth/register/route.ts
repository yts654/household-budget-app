import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sql } from "@/lib/db";
import { passwordSchema } from "@/lib/password-validation";
import { generateSecureToken } from "@/lib/token";
import { isRateLimited } from "@/lib/rate-limit";
import { sendVerificationEmail } from "@/lib/email";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
  displayName: z.string().min(1, "Display name is required").max(50),
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (isRateLimited(ip, "register", 5, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const { email, password, displayName } = parsed.data;

  // Check if user exists — return same success response to prevent email enumeration
  const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
  if (existing.rows.length > 0) {
    return NextResponse.json({
      success: true,
      message: "Please check your email to verify your account.",
    });
  }

  // Hash password and create user
  const passwordHash = await bcrypt.hash(password, 12);
  const result = await sql`
    INSERT INTO users (email, password_hash, display_name)
    VALUES (${email}, ${passwordHash}, ${displayName})
    RETURNING id
  `;

  // Generate verification token (24-hour expiry)
  const token = generateSecureToken();
  const userId = result.rows[0].id;
  await sql`
    INSERT INTO verification_tokens (user_id, token, type, expires_at)
    VALUES (${userId}, ${token}, 'email_verification', NOW() + INTERVAL '24 hours')
  `;

  // Send verification email
  await sendVerificationEmail(email, token);

  return NextResponse.json({
    success: true,
    message: "Please check your email to verify your account.",
  });
}
