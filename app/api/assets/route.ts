import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

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
  const { name, category, amount, institution, lastUpdated, note } = body;

  if (!name || !category || !amount || !institution || !lastUpdated) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const result = await sql`
    INSERT INTO assets (user_id, name, category, amount, institution, last_updated, note)
    VALUES (${session.user.id}, ${name}, ${category}, ${amount}, ${institution}, ${lastUpdated}, ${note || null})
    RETURNING id, name, category, amount, institution, last_updated::text as "lastUpdated", note
  `;

  return NextResponse.json(result.rows[0], { status: 201 });
}
