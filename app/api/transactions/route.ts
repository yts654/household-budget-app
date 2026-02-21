import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  category: z.string().min(1).max(50),
  amount: z.number().int().positive(),
  description: z.string().min(1).max(200),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
});

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
  const parsed = transactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const { type, category, amount, description, date } = parsed.data;

  const result = await sql`
    INSERT INTO transactions (user_id, type, category, amount, description, date)
    VALUES (${session.user.id}, ${type}, ${category}, ${amount}, ${description}, ${date})
    RETURNING id, type, category, amount, description, date::text
  `;

  return NextResponse.json(result.rows[0], { status: 201 });
}
