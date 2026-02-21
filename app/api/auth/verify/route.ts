import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return htmlResponse("Invalid Link", "No verification token provided.", false);
  }

  // Clean up expired tokens
  await sql`DELETE FROM verification_tokens WHERE expires_at < NOW()`;

  // Look up token
  const result = await sql`
    SELECT vt.id, vt.user_id, vt.type, vt.new_email, u.email
    FROM verification_tokens vt
    JOIN users u ON u.id = vt.user_id
    WHERE vt.token = ${token} AND vt.expires_at > NOW()
  `;

  if (result.rows.length === 0) {
    return htmlResponse(
      "Invalid or Expired Link",
      "This verification link is invalid or has expired. Please request a new one.",
      false
    );
  }

  const { user_id, type, new_email } = result.rows[0];

  if (type === "email_verification") {
    await sql`UPDATE users SET email_verified = TRUE, updated_at = NOW() WHERE id = ${user_id}`;
  } else if (type === "email_change" && new_email) {
    // Check if new email is taken
    const existing = await sql`SELECT id FROM users WHERE email = ${new_email} AND id != ${user_id}`;
    if (existing.rows.length > 0) {
      await sql`DELETE FROM verification_tokens WHERE token = ${token}`;
      return htmlResponse(
        "Email Already in Use",
        "This email address is already registered to another account.",
        false
      );
    }
    await sql`UPDATE users SET email = ${new_email}, updated_at = NOW() WHERE id = ${user_id}`;
  }

  // Delete used token
  await sql`DELETE FROM verification_tokens WHERE token = ${token}`;

  const message =
    type === "email_change"
      ? "Your email address has been updated successfully."
      : "Your email has been verified. You can now sign in.";

  return htmlResponse("Success!", message, true);
}

function htmlResponse(title: string, message: string, success: boolean) {
  const color = success ? "#22c55e" : "#ef4444";
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} - Kakeibo</title>
  ${success ? '<meta http-equiv="refresh" content="3;url=/login">' : ""}
</head>
<body style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f8f9fa;">
  <div style="text-align: center; max-width: 400px; padding: 32px; background: white; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
    <div style="font-size: 48px; margin-bottom: 16px;">${success ? "\u2705" : "\u274c"}</div>
    <h1 style="color: ${color}; margin: 0 0 12px;">${title}</h1>
    <p style="color: #666; line-height: 1.5;">${message}</p>
    ${success ? '<p style="color: #999; font-size: 14px; margin-top: 16px;">Redirecting to login page...</p>' : '<a href="/login" style="display: inline-block; margin-top: 16px; color: #4a6cf7; text-decoration: none;">Go to Login</a>'}
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
