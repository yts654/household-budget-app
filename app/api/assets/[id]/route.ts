import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { name, category, amount, institution, lastUpdated, note } = body;

  const result = await sql`
    UPDATE assets
    SET
      name = COALESCE(${name || null}, name),
      category = COALESCE(${category || null}, category),
      amount = COALESCE(${amount || null}, amount),
      institution = COALESCE(${institution || null}, institution),
      last_updated = COALESCE(${lastUpdated || null}, last_updated),
      note = ${note ?? null}
    WHERE id = ${id} AND user_id = ${session.user.id}
    RETURNING id, name, category, amount, institution, last_updated::text as "lastUpdated", note
  `;

  if (result.rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(result.rows[0]);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await sql`
    DELETE FROM assets
    WHERE id = ${id} AND user_id = ${session.user.id}
  `;

  return NextResponse.json({ success: true });
}
