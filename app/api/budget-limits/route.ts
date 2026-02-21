import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await sql`
    SELECT category, amount FROM budget_limits
    WHERE user_id = ${session.user.id}
  `;

  // Convert to record
  const limits: Record<string, number> = {};
  for (const row of result.rows) {
    limits[row.category] = row.amount;
  }

  return NextResponse.json(limits);
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const limits: Record<string, number> = body;

  // Upsert each category
  for (const [category, amount] of Object.entries(limits)) {
    if (amount > 0) {
      await sql`
        INSERT INTO budget_limits (user_id, category, amount)
        VALUES (${session.user.id}, ${category}, ${amount})
        ON CONFLICT (user_id, category)
        DO UPDATE SET amount = ${amount}
      `;
    } else {
      await sql`
        DELETE FROM budget_limits
        WHERE user_id = ${session.user.id} AND category = ${category}
      `;
    }
  }

  return NextResponse.json({ success: true });
}
