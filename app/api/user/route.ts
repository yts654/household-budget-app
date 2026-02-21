import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

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
  const { displayName, email } = body;

  if (email) {
    // Check if email is taken by another user
    const existing = await sql`
      SELECT id FROM users WHERE email = ${email} AND id != ${session.user.id}
    `;
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Email is already in use." }, { status: 409 });
    }
  }

  const result = await sql`
    UPDATE users
    SET
      display_name = COALESCE(${displayName || null}, display_name),
      email = COALESCE(${email || null}, email),
      updated_at = NOW()
    WHERE id = ${session.user.id}
    RETURNING id, email, display_name as "displayName"
  `;

  return NextResponse.json(result.rows[0]);
}
