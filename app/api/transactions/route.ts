import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await sql`
    SELECT id, type, category, amount, description, date::text
    FROM transactions
    WHERE user_id = ${session.user.id}
    ORDER BY date DESC, created_at DESC
  `;

  return NextResponse.json(result.rows);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { type, category, amount, description, date } = body;

  if (!type || !category || !amount || !description || !date) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const result = await sql`
    INSERT INTO transactions (user_id, type, category, amount, description, date)
    VALUES (${session.user.id}, ${type}, ${category}, ${amount}, ${description}, ${date})
    RETURNING id, type, category, amount, description, date::text
  `;

  return NextResponse.json(result.rows[0], { status: 201 });
}
