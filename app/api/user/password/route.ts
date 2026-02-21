import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { currentPassword, newPassword } = body;

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  // Verify current password
  const result = await sql`
    SELECT password_hash FROM users WHERE id = ${session.user.id}
  `;

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const isValid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
  if (!isValid) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 403 });
  }

  // Update password
  const newHash = await bcrypt.hash(newPassword, 12);
  await sql`
    UPDATE users SET password_hash = ${newHash}, updated_at = NOW()
    WHERE id = ${session.user.id}
  `;

  return NextResponse.json({ success: true });
}
