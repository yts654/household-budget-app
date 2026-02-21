import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sql } from "@/lib/db";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must include a lowercase letter")
    .regex(/[A-Z]/, "Password must include an uppercase letter")
    .regex(/[0-9]/, "Password must include a number"),
  displayName: z.string().min(1, "Display name is required").max(50),
});

// Simple in-memory rate limiter
const attempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = attempts.get(ip);
  if (!record || now > record.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return false;
  }
  record.count++;
  return record.count > 5;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  if (isRateLimited(ip)) {
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

  // Check if user exists
  const existing = await sql`SELECT id FROM users WHERE email = ${email}`;
  if (existing.rows.length > 0) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 }
    );
  }

  // Hash password and create user
  const passwordHash = await bcrypt.hash(password, 12);
  await sql`
    INSERT INTO users (email, password_hash, display_name)
    VALUES (${email}, ${passwordHash}, ${displayName})
  `;

  return NextResponse.json({ success: true }, { status: 201 });
}
