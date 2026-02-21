import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

const budgetLimitsSchema = z.record(
  z.string().min(1).max(50),
  z.number().int().min(0)
);

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
  const parsed = budgetLimitsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const limits = parsed.data;

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
