import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { generateSecureToken } from "@/lib/token";
import { sendEmailChangeVerification } from "@/lib/email";

const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  email: z.string().email().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await sql`
    SELECT id, email, display_name as "displayName", created_at as "createdAt"
    FROM users
    WHERE id = ${session.user.id}
  `;

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(result.rows[0]);
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const { displayName, email } = parsed.data;

  // Handle email change via verification
  if (email && email !== session.user.email) {
    // Check if email is taken by another user
    const existing = await sql`
      SELECT id FROM users WHERE email = ${email} AND id != ${session.user.id}
    `;
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Email is already in use." }, { status: 409 });
    }

    // Delete any existing email change tokens for this user
    await sql`
      DELETE FROM verification_tokens
      WHERE user_id = ${session.user.id} AND type = 'email_change'
    `;

    // Create verification token for email change
    const token = generateSecureToken();
    await sql`
      INSERT INTO verification_tokens (user_id, token, type, new_email, expires_at)
      VALUES (${session.user.id}, ${token}, 'email_change', ${email}, NOW() + INTERVAL '24 hours')
    `;

    await sendEmailChangeVerification(email, token);
  }

  // Update display name immediately (if provided)
  if (displayName) {
    await sql`
      UPDATE users
      SET display_name = ${displayName}, updated_at = NOW()
      WHERE id = ${session.user.id}
    `;
  }

  const result = await sql`
    SELECT id, email, display_name as "displayName"
    FROM users WHERE id = ${session.user.id}
  `;

  const responseData = result.rows[0];

  // If email change was requested, include a message
  if (email && email !== session.user.email) {
    return NextResponse.json({
      ...responseData,
      emailChangeMessage: "A verification email has been sent to your new address. Please click the link to confirm the change.",
    });
  }

  return NextResponse.json(responseData);
}
