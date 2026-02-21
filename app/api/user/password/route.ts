import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { passwordSchema } from "@/lib/password-validation";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
});

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const { currentPassword, newPassword } = parsed.data;

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

  // Check new password isn't same as old
  const isSame = await bcrypt.compare(newPassword, result.rows[0].password_hash);
  if (isSame) {
    return NextResponse.json(
      { error: "New password must be different from current password." },
      { status: 400 }
    );
  }

  // Update password
  const newHash = await bcrypt.hash(newPassword, 12);
  await sql`
    UPDATE users SET password_hash = ${newHash}, updated_at = NOW()
    WHERE id = ${session.user.id}
  `;

  return NextResponse.json({ success: true });
}
