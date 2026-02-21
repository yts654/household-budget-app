import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

const assetSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().min(1).max(50),
  amount: z.number().int(),
  institution: z.string().min(1).max(100),
  lastUpdated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  note: z.string().max(500).nullable().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await sql`
    SELECT id, name, category, amount, institution, last_updated::text as "lastUpdated", note
    FROM assets
    WHERE user_id = ${session.user.id}
    ORDER BY amount DESC
  `;

  return NextResponse.json(result.rows);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = assetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }

  const { name, category, amount, institution, lastUpdated, note } = parsed.data;

  const result = await sql`
    INSERT INTO assets (user_id, name, category, amount, institution, last_updated, note)
    VALUES (${session.user.id}, ${name}, ${category}, ${amount}, ${institution}, ${lastUpdated}, ${note || null})
    RETURNING id, name, category, amount, institution, last_updated::text as "lastUpdated", note
  `;

  return NextResponse.json(result.rows[0], { status: 201 });
}
